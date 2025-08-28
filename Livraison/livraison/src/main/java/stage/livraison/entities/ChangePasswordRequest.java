package stage.livraison.entities;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Data
public class ChangePasswordRequest {
    private String username;
    private String oldPassword;
    private String newPassword;


}
