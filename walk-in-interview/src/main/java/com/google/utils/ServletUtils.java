package com.google.utils;

import com.google.gson.Gson;

import javax.servlet.http.HttpServletRequest;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/** Util methods related to servlet. */
public final class ServletUtils {
    private ServletUtils() {}

    /**
     * @return the value of parameter with the {@code name} in the {@code request}
     *         or returns {@code defaultValue} if that parameter does not exist.
     */
    public static String getStringParameter(HttpServletRequest request, String name, String defaultValue) {
        String value = request.getParameter(name).trim();
        if (value == null || value.isEmpty()) {
            return defaultValue;
        }
        return value;
    }

    /**
     * Gets the integer parameter from html form input.
     *
     * @param request Http request.
     * @param parameterName Input id in html element.
     * @param defaultValue Default integer.
     * @return Parsed integer or default value if exception occur
     */
    public static int getIntParameter(HttpServletRequest request, String parameterName, int defaultValue) {
        String resultStr = request.getParameter(parameterName).trim();

        try {
            return Integer.parseInt(resultStr);
        } catch (NumberFormatException e) {
            // TODO(issue/12): error handling; can consider to add logging to log the error
            return defaultValue;
        }
    }

    /**
     * Gets the long parameter from html form input.
     *
     * @param request Http request.
     * @param parameterName Input id in html element.
     * @param defaultValue Default integer.
     * @return Parsed integer or default value if exception occur
     */
    public static long getLongParameter(HttpServletRequest request, String parameterName, long defaultValue) {
        String resultStr = request.getParameter(parameterName).trim();

        try {
            return Integer.parseInt(resultStr);
        } catch (NumberFormatException e) {
            // TODO(issue/12): error handling; can consider to add logging to log the error
            return defaultValue;
        }
    }

    /**
     * Gets the float parameter from html form input.
     *
     * @param request Http request.
     * @param parameterName Input id in html element.
     * @param defaultValue Default integer.
     * @return Parsed float or default value if exception occur
     */
    public static float getFloatParameter(HttpServletRequest request, String parameterName, float defaultValue) {
        String resultStr = request.getParameter(parameterName).trim();

        try {
            return Float.parseFloat(resultStr);
        } catch (NumberFormatException e) {
            // TODO(issue/12): error handling; can consider to add logging to log the error
            return defaultValue;
        }
    }

    /**
     * Gets the LocalDate parameter from html form input. The date format will be "yyyy-MM-dd".
     *
     * @param request Http request.
     * @param parameterName Input id in html element.
     * @param defaultValue Default integer.
     * @return Parsed date or default value if exception occur
     */
    public static Date getDateParameter(HttpServletRequest request,
                                        String parameterName, Date defaultValue) {
        String resultStr = request.getParameter(parameterName).trim();

        try {
            String pattern = "yyyy-MM-dd";
            Date result = new SimpleDateFormat(pattern).parse(resultStr);
            return result;
        } catch (NumberFormatException | ParseException e) {
            // TODO(issue/12): error handling; can consider to add logging to log the error
            return defaultValue;
        }
    }

    /**
     * @return the value of parameter with the {@code name} in the {@code request}
     *         or returns {@code defaultValue} if that parameter does not exist.
     */
    public static Boolean getBooleanParameter(HttpServletRequest request, String parameterName, Boolean defaultValue) {
        String resultStr = request.getParameter(parameterName).trim();

        try {
            return Boolean.parseBoolean(resultStr);
        } catch (NumberFormatException e) {
            // TODO(issue/12): error handling; can consider to add logging to log the error
            return defaultValue;
        }
    }

    /**
     * Converts the target item into json format.
     *
     * @param item Target item.
     * @return Target item in json format.
     */
    public static <T> String convertToJsonUsingGson(T item) {
        Gson gson = new Gson();
        String json = gson.toJson(item);
        return json;
    }

    /**
     * Converts the json string into the target class type.
     *
     * @param jsonStr Target json string.
     * @param classType Target class type.
     * @param <T> Generic format.
     * @return Object in the target class type.
     */
    public static <T> T parseFromJsonUsingGson(String jsonStr, Class<T> classType) {
        Gson gson = new Gson();
        T object = gson.fromJson(jsonStr, classType);
        return object;
    }
}
