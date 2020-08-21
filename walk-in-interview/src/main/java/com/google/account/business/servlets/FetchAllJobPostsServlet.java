package com.google.account.business.servlets;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.job.data.JobPage;
import com.google.job.data.JobsDatabase;
import com.google.utils.FirebaseAuthUtils;
import com.google.utils.ServletUtils;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.logging.Level;
import java.util.logging.Logger;

/** Servlet that handles getting all job posts made by this user */
@WebServlet("/my-jobs")
public final class FetchAllJobPostsServlet extends HttpServlet {
    private static final Logger LOGGER = Logger.getLogger(FetchAllJobPostsServlet.class.getName());

    private static final String PAGE_SIZE_PARAM = "pageSize";
    private static final String PAGE_INDEX_PARAM = "pageIndex";
    private static final long TIMEOUT_SECONDS = 5;

    private JobsDatabase jobsDatabase;

    @Override
    public void init() {
        this.jobsDatabase = new JobsDatabase();
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) {
        try {
            Optional<String> optionalUid = FirebaseAuthUtils.getUid(request);

            if (!optionalUid.isPresent()) {
                LOGGER.log(Level.SEVERE, /* msg= */ "Illegal uid");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            String uid = optionalUid.get();

            // Parses param from client
            int pageSize = parsePageSize(request);
            int pageIndex = parsePageIndex(request);

            JobPage jobPage = fetchJobPageDetails(uid, pageSize, pageIndex);

            String json = ServletUtils.convertToJsonUsingGson(jobPage);
            response.setContentType("application/json;");
            response.getWriter().println(json);
        } catch (ServletException | ExecutionException | TimeoutException | IOException | FirebaseAuthException e) {
            // TODO(issue/47): use custom exceptions
            LOGGER.log(Level.SEVERE, /* msg= */ "Error occur: " + e.getCause(), e);
            // Sends the fail status code in the response
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    /**
     * Fetches the all jobs made by the current business user.
     *
     * @param uid Uid of the current business user.
     * @param pageSize The the number of jobs to be shown on the page.
     * @param pageIndex The page number on which we are at.
     * Returns a JobPage object with all the details for the GET response.
     */
    private JobPage fetchJobPageDetails(String uid, int pageSize, int pageIndex)
            throws ServletException, ExecutionException, TimeoutException {
        try {
            return this.jobsDatabase.fetchAllJobMadePage(uid, pageSize, pageIndex)
                    .get(TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException | IOException e) {
            throw new ServletException(e);
        }
    }

    /**
     * Returns the page size as an int.
     *
     * @param request From the GET request.
     * Returns the page size.
     * @throws IllegalArgumentException if the page size is invalid.
     */
    public static int parsePageSize(HttpServletRequest request) throws IllegalArgumentException {
        String pageSizeStr = ServletUtils.getStringParameter(
                request, PAGE_SIZE_PARAM, /* defaultValue= */ "");

        if (pageSizeStr.isEmpty()) {
            throw new IllegalArgumentException("page size param should not be empty");
        }

        try {
            return Integer.parseInt(pageSizeStr);
        } catch(NumberFormatException e) {
            throw new IllegalArgumentException("page size param should be an int");
        }
    }

    /**
     * Returns the page index as an int.
     *
     * @param request From the GET request.
     * Returns the page index.
     * @throws IllegalArgumentException if the page index is invalid.
     */
    public static int parsePageIndex(HttpServletRequest request) throws IllegalArgumentException {
        String pageIndexStr = ServletUtils.getStringParameter(
                request, PAGE_INDEX_PARAM, /* defaultValue= */ "");

        if (pageIndexStr.isEmpty()) {
            throw new IllegalArgumentException("page index param should not be empty");
        }

        try {
            return Integer.parseInt(pageIndexStr);
        } catch(NumberFormatException e) {
            throw new IllegalArgumentException("page index param should be an int");
        }
    }
}
