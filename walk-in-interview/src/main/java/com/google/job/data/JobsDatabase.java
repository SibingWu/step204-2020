package com.google.job.data;

import com.google.account.business.data.BusinessDatabase;
import com.google.api.core.ApiFunction;
import com.google.api.core.ApiFuture;
import com.google.api.core.ApiFutures;
import com.google.appengine.repackaged.com.google.common.collect.ImmutableSet;
import com.google.cloud.firestore.*;
import com.google.common.collect.ImmutableList;
import com.google.common.util.concurrent.Futures;
import com.google.common.util.concurrent.MoreExecutors;
import com.google.utils.FireStoreUtils;
import org.checkerframework.checker.nullness.compatqual.NullableDecl;
import org.apache.commons.lang3.Range;
import java.lang.UnsupportedOperationException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Future;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;
import java.util.logging.Level;

/** Helps persist and retrieve job posts. */
public final class JobsDatabase {
    private static final Logger log = Logger.getLogger(JobsDatabase.class.getName());

    private static final String JOB_COLLECTION = "Jobs";
    private static final String APPLICANT_ACCOUNTS_COLLECTION = "ApplicantAccounts";
    private static final String BUSINESS_ACCOUNT_COLLECTION = "BusinessAccounts";

    private static final String SALARY_FIELD = "jobPay.annualMax";
    private static final String REGION_FIELD = "jobLocation.region";
    private static final String JOB_STATUS_FIELD = "jobStatus";
    private static final String JOB_REQUIREMENTS_FIELD = "requirements";
    private static final String INTERESTED_JOBS_FIELD = "interestedJobs";
    private static final String ALL_JOBS_FIELD = "jobs";
    private static final String JOB_ID_FIELD = "jobId";
    
    private static final long TIMEOUT_SECONDS = 5;
    private static final int FIRESTORE_IN_QUERY_MAX_ARGS = 10;

    private final BusinessDatabase businessDatabase = new BusinessDatabase();

    /**
     * Adds a newly created job post.
     * Updates the business account accordingly.
     *
     * @param uid Uid of the current user.
     * @param newJob Newly created job post. Assumes that it is non-nullable.
     * @return A future of the detailed information of the writing.
     */
    public Future<WriteResult> addJob(String uid, Job newJob) throws IOException {
        // Add document data after generating an id
        DocumentReference addedDocRef = FireStoreUtils.getFireStore()
                .collection(JOB_COLLECTION).document();

        String jobId = addedDocRef.getId();

        // TODO: find a way to do this outside JobsDatabase
        //  i.e. how to retrieve jobId of a newly added document outside this function
        //  so far jobId cannot be retrieved from WriteResult

        // Updates the business account accordingly
        this.businessDatabase.updateJobsMade(uid, jobId);

        // Updates the Job with cloud firestore id
        // Status is already set when parsing the job post
        Job job = newJob.toBuilder()
                .setJobId(jobId)
                .build();

        return addedDocRef.set(job);
    }

    /**
     * Edits the job post.
     *
     * @param jobId Id for the target job post in the database.
     * @param updatedJob Updated job post (with cloud firestore id).
     * @return A future of document reference for the updated job post.
     * @throws IllegalArgumentException If the job id is invalid.
     */
    public Future<DocumentReference> setJob(String jobId, Job updatedJob) throws IllegalArgumentException, IOException {
        if (jobId.isEmpty()) {
            throw new IllegalArgumentException("Job Id should be an non-empty string");
        }

        // Runs an asynchronous transaction
        ApiFuture<DocumentReference> futureTransaction = FireStoreUtils.getFireStore().runTransaction(transaction -> {
            final DocumentReference documentReference = FireStoreUtils.getFireStore()
                    .collection(JOB_COLLECTION).document(jobId);

            // Verifies if the current user can update the job post with this job id
            // TODO(issue/25): incorporate the account stuff into job post.
            DocumentSnapshot documentSnapshot = transaction.get(documentReference).get();

            // Job does not exist
            if (!documentSnapshot.exists()) {
                throw new IllegalArgumentException("Invalid jobId");
            }

            // Overwrites the whole job post
            transaction.set(documentReference, updatedJob);

            return documentReference;
        });
        
        return futureTransaction;
    }

    /**
     * Marks a job post as DELETED.
     *
     * @param jobId Cloud Firestore Id of the job post.
     * @return A future of document reference for the updated job post.
     */
    public Future<DocumentReference> markJobPostAsDeleted(String jobId) throws IOException {
        if (jobId.isEmpty()) {
            throw new IllegalArgumentException("Job Id should be an non-empty string");
        }
        
        // Runs an asynchronous transaction
        ApiFuture<DocumentReference> futureTransaction = FireStoreUtils.getFireStore().runTransaction(transaction -> {
            final DocumentReference documentReference = FireStoreUtils.getFireStore()
                    .collection(JOB_COLLECTION).document(jobId);

            // Verifies if the current user can update the job post with this job id
            // TODO(issue/25): incorporate the account stuff into job post.
            DocumentSnapshot documentSnapshot = transaction.get(documentReference).get();

            // Job does not exist
            if (!documentSnapshot.exists()) {
                throw new IllegalArgumentException("Invalid jobId");
            }

            // Updates the jobStatus field to DELETED
            transaction.update(documentReference, JOB_STATUS_FIELD, JobStatus.DELETED);

            return documentReference;
        });

        return futureTransaction;
    }

    /**
     * Fetches the snapshot future of a specific job post.
     *
     * @param jobId Id for the job post in the database.
     * @return Future of the target job post.
     * @throws IllegalArgumentException If the job id is invalid.
     */
    public Future<Optional<Job>> fetchJob(String jobId) throws IllegalArgumentException, IOException {
        DocumentReference docRef = FireStoreUtils.getFireStore()
                .collection(JOB_COLLECTION).document(jobId);

        // Asynchronously retrieves the document
        ApiFuture<DocumentSnapshot> snapshotFuture = docRef.get();

        ApiFunction<DocumentSnapshot, Optional<Job>> jobFunction = new ApiFunction<DocumentSnapshot, Optional<Job>>() {
            @NullableDecl
            public Optional<Job> apply(@NullableDecl DocumentSnapshot documentSnapshot) {
                return FireStoreUtils.convertDocumentSnapshotToPOJO(documentSnapshot, Job.class);
            }
        };

        return ApiFutures.transform(snapshotFuture, jobFunction, MoreExecutors.directExecutor());
    }

    /** Returns future of all ACTIVE and eligible job posts in database. */
    public Future<Collection<Job>> fetchAllEligibleJobs(List<String> skills) throws IOException {
        // Gets all requirements stable id
        List<String> requirementsList = Requirement.getAllRequirementIds();

        // Gets a list of requirements which the applicant does not have
        List<String> excludedSkills = new ArrayList<>(requirementsList);
        excludedSkills.removeAll(skills);

        final Query activeJobsQuery = FireStoreUtils.getFireStore()
                .collection(JOB_COLLECTION)
                .whereEqualTo(JOB_STATUS_FIELD, JobStatus.ACTIVE);

        // Eligible post: post whose requirements do not contain (field is false)
        // the skills that applicant does not have
        Query eligiblePostQuery = activeJobsQuery;
        for (String negateSkill : excludedSkills) {
            String fieldPath = String.format("%s.%s", JOB_REQUIREMENTS_FIELD, negateSkill);
            eligiblePostQuery = eligiblePostQuery.whereEqualTo(fieldPath, false);
        }

        ApiFuture<QuerySnapshot> querySnapshotFuture = eligiblePostQuery.get();

        ApiFunction<QuerySnapshot, Collection<Job>> function = documents -> {
            ImmutableSet.Builder<Job> jobs = ImmutableSet.builder();

            for (DocumentSnapshot document : documents) {
                Job job = document.toObject(Job.class);
                jobs.add(job);
            }

            return jobs.build();
        };

        return ApiFutures.transform(querySnapshotFuture, function, MoreExecutors.directExecutor());
    }

    /**
     * Gets all the jobs given the params from the database.
     * Currently, they can only be sorted/filtered by salary.
     *
     * @param jobQuery The job query object with all the filtering/sorting params.
     * @return Future of the JobPage object.
     */
    public static Future<JobPage> fetchJobPage(JobQuery jobQuery) throws IOException {
        CollectionReference jobsCollection = FireStoreUtils.getFireStore().collection(JOB_COLLECTION);

        // TODO(issue/62): support other filters
        if (!jobQuery.getSortBy().equals(Filter.SALARY)) {
            throw new UnsupportedOperationException("currently this app only supports sorting/filtering by salary");
        }

        Query query = jobsCollection.whereEqualTo(JOB_STATUS_FIELD, JobStatus.ACTIVE.name())
            .whereGreaterThanOrEqualTo(SALARY_FIELD, jobQuery.getMinLimit())
            .whereLessThanOrEqualTo(SALARY_FIELD, jobQuery.getMaxLimit())
            .orderBy(SALARY_FIELD, Order.getQueryDirection(jobQuery.getOrder()));

        SingaporeRegion region = jobQuery.getRegion();
        if (!region.equals(SingaporeRegion.ENTIRE)) {
            query = query.whereEqualTo(REGION_FIELD, region.name());
        }

        // TODO(issue/34): add to the query to include pagination (using pageSize and pageIndex)

        return ApiFutures.transform(
            query.get(),
            querySnapshot -> {
                if (querySnapshot == null) {
                    return new JobPage(/* jobList= */ ImmutableList.of(), /* totalCount= */ 0, Range.between(0, 0));
                }

                List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
                if (documents.size() == 0) {
                    return new JobPage(ImmutableList.of(), 0, Range.between(0, 0));
                }

                ImmutableList.Builder<Job> jobList = ImmutableList.builder();

                for (QueryDocumentSnapshot document : documents) {
                    Job job = document.toObject(Job.class);
                    jobList.add(job);
                }
            
                // TODO(issue/34): adjust range/total count based on pagination
                long totalCount = documents.size();
                Range<Integer> range = Range.between(1, documents.size());

                return new JobPage(jobList.build(), totalCount, range);  
            },
            MoreExecutors.directExecutor()
        );
    }

    /**
     * Gets all the applicant's interested jobs given the params. If there's an error in getting a particular job
     * from the jobId, then that specific job will not be returned.
     *
     * @param applicantId The applicant's userId.
     * @param pageSize The the number of jobs to be shown on the page.
     * @param pageIndex The page number on which we are at.
     * @return Future of the JobPage object.
     * @throws IllegalArgumentException If the applicantId doesn't have a corresponding document.
     */
    public Future<JobPage> fetchInterestedJobPage(String applicantId, int pageSize, int pageIndex)
            throws IOException, IllegalArgumentException {
        CollectionReference applicantAccountsCollection = FireStoreUtils.getFireStore()
                .collection(APPLICANT_ACCOUNTS_COLLECTION);

        DocumentReference docRef = applicantAccountsCollection.document(applicantId);

        return ApiFutures.transform(
            docRef.get(),
            documentSnapshot -> {
                if (!documentSnapshot.exists()) {
                    throw new IllegalArgumentException("Invalid applicantId");
                }

                List<String> interestedList = (List<String>) documentSnapshot.get(INTERESTED_JOBS_FIELD);

                List<Job> jobList = fetchAllJobsFromIds(interestedList);
                // TODO(issue/34): adjust range/total count based on pagination
                long totalCount = jobList.size();
                Range<Integer> range = Range.between(1, jobList.size());

                return new JobPage(jobList, totalCount, range);
            },
            MoreExecutors.directExecutor()
        );
    }

    /**
     * Fetches all the jobs post made by the specific business account.
     *
     * @param businessId Uid of the business account.
     * @param pageSize The the number of jobs to be shown on the page.
     * @param pageIndex The page number on which we are at.
     * Returns future of the JobPage object.
     * @throws IllegalArgumentException If it is not a valid existing uid for business account.
     */
    public Future<JobPage> fetchAllJobMadePage(String businessId, int pageSize, int pageIndex)
            throws IOException, IllegalArgumentException {
        CollectionReference businessAccountsCollection = FireStoreUtils.getFireStore()
                .collection(BUSINESS_ACCOUNT_COLLECTION);

        DocumentReference docRef = businessAccountsCollection.document(businessId);

        return ApiFutures.transform(
                docRef.get(),
                documentSnapshot -> {
                    if (!documentSnapshot.exists()) {
                        throw new IllegalArgumentException("Invalid businessId");
                    }

                    List<String> jobs = (List<String>) documentSnapshot.get(ALL_JOBS_FIELD);

                    List<Job> jobList = fetchAllJobsFromIds(jobs);
                    // TODO(issue/34): adjust range/total count based on pagination
                    long totalCount = jobList.size();
                    Range<Integer> range = totalCount == 0 ? Range.between(0, 0) : Range.between(1, jobList.size());

                    return new JobPage(jobList, totalCount, range);
                },
                MoreExecutors.directExecutor()
        );
    }

    /**
     * This will return a list of jobs given the list of jobIds.
     * It will call on a helper function that will process the list at max {@link #FIRESTORE_IN_QUERY_MAX_ARGS}
     * ids at a time.
     * Any jobs that are not active or invalid will not be included in the list returned.
     *
     * @param jobIds The list of jobIds.
     * @return The list of jobs.
     */
    public List<Job> fetchAllJobsFromIds(List<String> jobIds) {
        if (jobIds.isEmpty()) {
            return ImmutableList.of();
        }

        ImmutableList.Builder<Job> jobListBuilder = ImmutableList.builder();
        try {
            int counter = 0;
            // TODO(issue/34): pagination could also be included here.
            while (counter + FIRESTORE_IN_QUERY_MAX_ARGS < jobIds.size()) {
                List<String> subList = jobIds.subList(/* inclusive */ counter, /* exclusive */ counter + FIRESTORE_IN_QUERY_MAX_ARGS);
                List<Job> fetchedList = fetchJobsFromIds(subList).get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
                jobListBuilder.addAll(fetchedList);
                counter = counter + FIRESTORE_IN_QUERY_MAX_ARGS;
            }
            List<String> subList = jobIds.subList(/* inclusive */ counter, /* exclusive */ jobIds.size());
            List<Job> fetchedList = fetchJobsFromIds(subList).get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            jobListBuilder.addAll(fetchedList);
        } catch (IOException | InterruptedException | ExecutionException | TimeoutException e) {
            log.log(Level.SEVERE, "error while getting interested job list ", e);
        }

        return jobListBuilder.build();
    }

    /**
     * This will return a future of a list of jobs given the list of jobIds.
     * Any jobs that are not active or invalid will not be included in the list returned.
     * This can only handle up to {@link #FIRESTORE_IN_QUERY_MAX_ARGS} jobIds at a time.
     *
     * @param jobIds The list of jobIds.
     * @return Future of the list of jobs.
     */
    private Future<List<Job>> fetchJobsFromIds(List<String> jobIds) throws IOException {
        if (jobIds.isEmpty()) {
            return Futures.immediateFuture(ImmutableList.of());
        }

        CollectionReference jobsCollection = FireStoreUtils.getFireStore().collection(JOB_COLLECTION);

        Query query = jobsCollection.whereEqualTo(JOB_STATUS_FIELD, JobStatus.ACTIVE.name())
            .whereIn(JOB_ID_FIELD, jobIds);

        return ApiFutures.transform(
            query.get(),
            querySnapshot -> {
                if (querySnapshot == null) {
                    return ImmutableList.of();
                }

                List<QueryDocumentSnapshot> documents = querySnapshot.getDocuments();
                if (documents.size() == 0) {
                    return ImmutableList.of();
                }

                ImmutableList.Builder<Job> jobList = ImmutableList.builder();

                for (QueryDocumentSnapshot document : documents) {
                    Job job = document.toObject(Job.class);
                    jobList.add(job);
                }

                return jobList.build();  
            },
            MoreExecutors.directExecutor()
        );
    }
    
    /*
     * Updates the applicant's interested list to add or remove the job.
     *
     * @param applicantId The applicant's userId.
     * @param jobId The job id.
     * @param interested Whether the applicant is currently interested in it or not.
     * @return A future of document reference for the applicant's update job list.
     */
    public static Future<DocumentReference> updateInterestedJobsList(String applicantId, String jobId, boolean interested) throws IOException, IllegalArgumentException, Exception {
        return FireStoreUtils.getFireStore().runTransaction(transaction -> {
            final DocumentReference documentReference = FireStoreUtils.getFireStore()
                    .collection(APPLICANT_ACCOUNTS_COLLECTION).document(applicantId);

            if (interested) {
                // Remove the jobId
                // Does nothing if it already isn't there
                documentReference.update(INTERESTED_JOBS_FIELD, FieldValue.arrayRemove(jobId));
            } else {
                // Add the jobId
                // Does nothing if it already exists
                documentReference.update(INTERESTED_JOBS_FIELD, FieldValue.arrayUnion(jobId));
            }

            return documentReference;
        });
    }
}
