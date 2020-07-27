package com.google.account.applicant;

import com.google.utils.ServletUtils;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Servlet that handles marking/unmarking interest for job post.
 */
@WebServlet("/my-interested-list")
public final class InterestedJobServlet extends HttpServlet {
    private static final String PARAM_JOB_ID = "jobId";
    private static final String PARAM_INTEREST_STATUS = "interested";

    private ApplicantDatabase applicantDatabase;

    @Override
    public void init() {
        // this.applicantDatabase = new ApplicantDatabase();
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

        } catch (IllegalArgumentException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

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
}
