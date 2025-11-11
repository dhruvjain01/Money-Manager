package in.moneymanager.MoneyManager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Store the full name of the user
    private String fullName;

    // store the email id of the user and ensuring it to be unique and cannot be null
    @Column(unique = true)
    private String email;

    // Store the password of the user
    private String password;

    // Store the image url of the user
    private String profileImageUrl;

    // Store the creation time stamp at which the profile was created and ensuring that the column cannot be updated
    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // Store the time stamp at which the profile was last updated
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Store the flag to see if the user has activated the profile via email or not
    private Boolean isActive;

    // Store the activation token of the user
    private String activationToken;

    // using this prePersist method to set a default value before inserting into the table
    @PrePersist
    public void prePersist(){
        if(this.isActive == null){
            isActive = false;
        }
    }
}
