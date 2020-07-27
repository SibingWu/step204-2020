package com.google.account.applicant;

import com.google.common.collect.ImmutableList;

import java.util.List;

/** Class for an applicant account. */
public final class Applicant {
    private final String name;
    private final List<String> skills;

    private volatile int hashCode;

    // No-argument constructor is needed to deserialize object when interacting with cloud firestore.
    public Applicant() {
        this("", ImmutableList.of());
    }

    public Applicant(String name, List<String> skills) {
        this.name = name;
        this.skills = ImmutableList.copyOf(skills);
    }

    public String getName() {
        return name;
    }

    public List<String> getSkills() {
        return skills;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Applicant applicant = (Applicant) o;
        return name.equals(applicant.name) &&
                skills.equals(applicant.skills);
    }

    @Override
    public int hashCode() {
        if (this.hashCode != 0) {
            return this.hashCode;
        }

        int result = 0;

        int c = name.hashCode();
        result = 31 * result + c;

        c = skills.hashCode();
        result = 31 * result + c;

        this.hashCode = result;

        return this.hashCode;
    }

    @Override
    public String toString() {
        return String.format("Applicant{name=%s, skills=}", name, skills);
    }
}
