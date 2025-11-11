package in.moneymanager.MoneyManager.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterDTO {
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String keyword;
    private String sortField; // date, amount, name
    private String sortOrder; // asc or desc
}
