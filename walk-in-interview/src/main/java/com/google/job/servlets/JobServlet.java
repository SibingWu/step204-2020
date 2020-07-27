package com.google.job.servlets;

import com.google.job.data.*;
import com.google.utils.ServletUtils;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;
import java.util.Optional;

/**
 * Servlet that handles posting new job posts, updating existing job posts,
 * and getting an individual job post.
 */
@WebServlet("/jobs")
public final class JobServlet extends HttpServlet {
    private static final String PATCH_METHOD_TYPE = "PATCH";
    private static final long TIMEOUT_SECONDS = 5;
    private static final String JOB_ID_FIELD = "jobId";

    private JobsDatabase jobsDatabase;

    @Override
    public void init() {
        this.jobsDatabase = new JobsDatabase();
    }

    @Override
    public void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Explicitly routes PATCH requests to a doPatch method since by default HttpServlet doesn't do it for us.
        if (request.getMethod().equalsIgnoreCase(PATCH_METHOD_TYPE)){
            doPatch(request, response);
        } else {
            super.service(request, response);
        }
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            String jobId = parseJobId(request);

            Optional<Job> job = fetchJobDetails(jobId);

            if (!job.isPresent()) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                return;
            }

            String json = ServletUtils.convertToJsonUsingGson(job.get());
            response.setContentType("application/json;");
            response.getWriter().println(json);
        } catch(IllegalArgumentException | ServletException | ExecutionException | TimeoutException | IOException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Gets job post from the form
            Job rawJob = parseRawJobPost(request);

            // New jobs always start in ACTIVE status.
            Job job = rawJob.toBuilder().setJobStatus(JobStatus.ACTIVE).build();

            // Stores job post into the database
            storeJobPost(job);

            // Sends the success status code in the response
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (ExecutionException | IllegalArgumentException | ServletException | IOException | TimeoutException e) {
            // TODO(issue/47): use custom exceptions
            System.err.println("Error occur: " + e.getCause());
            // Sends the fail status code in the response
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    /** Handles the PATCH request from client. */
    public void doPatch(HttpServletRequest request, HttpServletResponse response) {
        try {
            // Gets job post (with cloud firestore id) from the form
            Job updatedJob = parseRawJobPost(request);
            String jobId = updatedJob.getJobId();

            // Stores job post into the database
            updateJobPost(jobId, updatedJob);

            // Sends the success status code in the response
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (ExecutionException | IllegalArgumentException | ServletException | TimeoutException | IOException e) {
            // TODO(issue/47): use custom exceptions
            System.err.println("Error occur: " + e.getCause());
            // Sends the fail status code in the response
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    /** Parses into valid Job object from json received from client request. */
    private Job parseRawJobPost(HttpServletRequest request) throws IOException, IllegalArgumentException {
        // Parses job object from the POST request
        try (BufferedReader bufferedReader = request.getReader()) {
            String jobPostJsonStr = bufferedReader.lines().collect(Collectors.joining(System.lineSeparator())).trim();

            if (StringUtils.isBlank(jobPostJsonStr)) {
                throw new IllegalArgumentException("Json for Job object is Empty");
            }

            Job rawJob = ServletUtils.parseFromJsonUsingGson(jobPostJsonStr, Job.class);

            // Validates the attributes via build()
            return rawJob.toBuilder().build();
        }
    }

    /** Stores the job post into the database. */
    private void storeJobPost(Job job) throws ServletException, ExecutionException, TimeoutException {
        try {
            // Blocks the operation.
            // Use timeout in case it blocks forever.
            this.jobsDatabase.addJob(job).get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException | IOException e) {
            throw new ServletException(e);
        }
    }

    /** Updates the target job post in the database. */
    private void updateJobPost(String jobId, Job job)
            throws IllegalArgumentException, ServletException, ExecutionException, TimeoutException {
        try {
            // Blocks the operation.
            // Use timeout in case it blocks forever.
            this.jobsDatabase.setJob(jobId, job).get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException | IOException e) {
            throw new ServletException(e);
        }
    }

    /**
     * Returns the optional Job object.
     *
     * @param jobId The job id that corresponds to the job we want to get.
     * @return optional Job object with all the details of the job.
     */
    private Optional<Job> fetchJobDetails(String jobId) throws ServletException, ExecutionException, TimeoutException {
        try {
            return this.jobsDatabase.fetchJob(jobId)
                    .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException | IOException e) {
            throw new ServletException(e);
        }
    }

    /**
     * Returns the job id.
     *
     * @param request From the GET request.
     * @return the job id.
     * @throws IllegalArgumentException if the job id is invalid.
     */
    private String parseJobId(HttpServletRequest request) throws IllegalArgumentException {
        String jobIdStr = ServletUtils.getStringParameter(request, JOB_ID_FIELD, /* defaultValue= */ "");

        if (jobIdStr.isEmpty()) {
            throw new IllegalArgumentException("job id param should not be empty");
        }

        return jobIdStr;
    }
}
