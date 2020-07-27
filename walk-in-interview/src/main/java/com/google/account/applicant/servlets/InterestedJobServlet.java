package com.google.account.applicant.servlets;

import com.google.account.applicant.data.ApplicantDatabase;
import com.google.utils.ServletUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Servlet that handles marking/unmarking interest for job post.
 */
@WebServlet("/my-interested-list")
public final class InterestedJobServlet extends HttpServlet {
    private static final long TIMEOUT_SECONDS = 5;
    private static final String PARAM_JOB_ID = "jobId";
    private static final String PARAM_INTEREST_STATUS = "interested";

    private ApplicantDatabase applicantDatabase;

    @Override
    public void init() {
        this.applicantDatabase = new ApplicantDatabase();
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            // Gets the applicant id from the client
            String applicantId = getApplicantId();

            // Gets the jobId from the client
            String jobId = parseJobId(request);

            // Gets the interest status from the client
            Boolean interest = ServletUtils.getBooleanParameter(request, PARAM_INTEREST_STATUS, false);

            // Toggles the interest status
            toggleInterest(applicantId, jobId, interest);

            // Sends the success status code in the response
            response.setStatus(HttpServletResponse.SC_OK);
        } catch (IllegalArgumentException | ServletException | ExecutionException | TimeoutException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    /** Gets the applicant id from the client */
    private String getApplicantId() {
        return "Not implemented";
    }

    /**
     * Returns the job id.
     *
     * @param request From the POST request.
     * @return The job id.
     * @throws IllegalArgumentException If the job id is empty.
     */
    private String parseJobId(HttpServletRequest request) throws IllegalArgumentException {
        String jobIdStr = ServletUtils.getStringParameter(request, PARAM_JOB_ID, /* defaultValue= */ "");

        if (jobIdStr.isEmpty()) {
            throw new IllegalArgumentException("job id param should not be empty");
        }

        return jobIdStr;
    }

    /** Updates the target job post in the database. */
    private void toggleInterest(String applicantId, String jobId, Boolean interest)
            throws IllegalArgumentException, ServletException, ExecutionException, TimeoutException {
        try {
            // Blocks the operation.
            // Use timeout in case it blocks forever.
            this.applicantDatabase.toggleInterestStatus(applicantId, jobId, interest)
                    .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException | IOException e) {
            throw new ServletException(e);
        }
    }
}
