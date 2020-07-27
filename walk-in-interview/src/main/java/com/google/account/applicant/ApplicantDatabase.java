package com.google.account.applicant;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.utils.FireStoreUtils;

import java.io.IOException;
import java.util.List;

/** Helps persist and retrieve applicant accounts. */
public final class ApplicantDatabase {
    private static final String APPLICANT_COLLECTION = "Applicants";

    /**
     * Toggles the interest status for the specific applicant user.
     *
     * @param applicantId Id for the target applicant in the database.
     * @param jobId Id for the target job post in the database.
     * @param interest Current interest status of the user towards that job post.
     * @throws IllegalArgumentException If the applicant id or job id is invalid.
     */
    public void toggleInterestStatus(String applicantId, String jobId, Boolean interest)
            throws IllegalArgumentException, IOException {
        if (applicantId.isEmpty()) {
            throw new IllegalArgumentException("Applicant Id should be an non-empty string");
        }

        if (jobId.isEmpty()) {
            throw new IllegalArgumentException("Job Id should be an non-empty string");
        }

        // Runs an asynchronous transaction
        ApiFuture<Void> futureTransaction = FireStoreUtils.getFireStore().runTransaction(transaction -> {
            final DocumentReference documentReference = FireStoreUtils.getFireStore()
                    .collection(APPLICANT_COLLECTION).document(jobId);

            // Verifies if the current user can update the job post with this job id
            // TODO(issue/25): incorporate the account stuff into job post.
            DocumentSnapshot documentSnapshot = transaction.get(documentReference).get();

            // Job does not exist
            if (!documentSnapshot.exists()) {
                throw new IllegalArgumentException("Invalid jobId");
            }

            List<String> skills = (List<String>) documentSnapshot.get("skills");

            if (interest) {
                skills.remove(jobId);
            } else {
                skills.add(jobId);
            }

            return null;
        });
    }
}
