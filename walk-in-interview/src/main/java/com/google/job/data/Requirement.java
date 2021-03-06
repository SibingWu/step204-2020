package com.google.job.data;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/** Enumeration that represents the requirements of jobs. */
public enum Requirement {
    // TODO(issue/26): add more requirements
    O_LEVEL("O_LEVEL", ImmutableMap.of("en", "O Level")),
    ENGLISH("LANGUAGE_ENGLISH", ImmutableMap.of("en", "English")),
    DRIVING_LICENSE_C("DRIVING_LICENSE_C", ImmutableMap.of("en", "Category C Driving License"));

    private final String requirementId;
    private final Map<String, String> localizedNameByLanguage;

    Requirement(String requirementId, Map<String, String> localizedNameByLanguage){
        this.requirementId = requirementId;
        this.localizedNameByLanguage = localizedNameByLanguage;
    }

    /** Returns the stable id representing the requirement. Can be stored in database. */
    public String getRequirementId() {
        return requirementId;
    }

    /** Gets the requirement stable ids given enum value. */
    public static List<String> getRequirementIds(List<Requirement> requirements) {
        ImmutableList.Builder<String> requirementIds = ImmutableList.builder();
        for (Requirement requirement: requirements) {
            String id = requirement.getRequirementId();
            requirementIds.add(id);
        }

        return requirementIds.build();
    }

    /** Returns the requirement stable ids of the all requirements. */
    public static List<String> getAllRequirementIds() {
        return getRequirementIds(Arrays.asList(Requirement.values()));
    }

    /**
     * Gets the localized requirement name with the specified version of language.
     *
     * @param language Language version to be displayed.
     * @return Localized name of the requirement.
     */
    public String getLocalizedName(String language) throws IllegalArgumentException {
        String localizedName = localizedNameByLanguage.get(language);
        if (localizedName == null) {
            throw new IllegalArgumentException("Language is not supported");
        }

        return localizedName;
    }

    /**
     * Returns the localized names of the specified requirements.
     *
     * @throw IllegalArgumentException If the language is not supported.
     */
    public static List<String> getLocalizedNames(List<Requirement> requirements, String language)
            throws IllegalArgumentException {
        ImmutableList.Builder<String> localizedNames = ImmutableList.builder();
        for (Requirement requirement: requirements) {
            String localizedName = requirement.getLocalizedName(language);
            localizedNames.add(localizedName);
        }

        return localizedNames.build();
    }

    /**
     * Returns the localized names of the all requirements.
     *
     * @throw IllegalArgumentException If the language is not supported.
     */
    public static List<String> getAllLocalizedNames(String language) throws IllegalArgumentException {
        return getLocalizedNames(Arrays.asList(Requirement.values()), language);
    }
}
