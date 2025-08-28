package stage.livraison.entities;

import com.fasterxml.jackson.annotation.JsonCreator;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum Role {
    ROLE_ADMIN,ROLE_EXPEDITEUR,ROLE_LIVREUR,ROLE_AGENT,ROLE_COMPTABLE;


    @JsonCreator
    public static Role fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Role cannot be empty");
        }
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid role value. Allowed values are: " +
                            Arrays.stream(values()).map(Enum::name).collect(Collectors.joining(", "))
            );
        }
    }
}
