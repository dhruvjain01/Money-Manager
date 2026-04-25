package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.dto.ExpenseDTO;
import in.moneymanager.MoneyManager.dto.IncomeDTO;
import in.moneymanager.MoneyManager.dto.RecentTransactionDTO;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Stream.concat;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final ProfileService profileService;

    public Map<String,Object> getDashboardData(){

        ProfileEntity profile = profileService.getCurrentProfile();

        Map<String,Object> data = new LinkedHashMap<>();

        List<IncomeDTO> latestIncomes = incomeService.getLatest5IncomeForCurrentUser();
        List<ExpenseDTO> latestExpenses = expenseService.getLatest5ExpenseForCurrentUser();

        List<RecentTransactionDTO> recentTransactions = concat(
                latestIncomes.stream().map(income -> mapToRecentTransaction(income, profile.getId())),
                latestExpenses.stream().map(expense -> mapToRecentTransaction(expense, profile.getId()))
        ).sorted((a, b) -> {
            int cmp = b.getDate().compareTo(a.getDate());
            if (cmp == 0 && a.getCreatedAt() != null && b.getCreatedAt() != null) {
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            }
            return cmp;
        }).collect(Collectors.toList());

        BigDecimal totalIncome = incomeService.totalIncome();
        BigDecimal totalExpense = expenseService.totalExpenses();

        data.put("totalBalance", totalIncome.subtract(totalExpense));
        data.put("totalIncome", totalIncome);
        data.put("totalExpense", totalExpense);
        data.put("recentExpenses", latestExpenses);
        data.put("recentIncomes", latestIncomes);
        data.put("recentTransactions", recentTransactions);
        return data;
    }

    private RecentTransactionDTO mapToRecentTransaction(IncomeDTO dto, Long profileId) {
        return RecentTransactionDTO.builder()
                .id(dto.getId())
                .profileId(profileId)
                .icon(dto.getIcon())
                .name(dto.getName())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .type("income")
                .build();
    }

    private RecentTransactionDTO mapToRecentTransaction(ExpenseDTO dto, Long profileId) {
        return RecentTransactionDTO.builder()
                .id(dto.getId())
                .profileId(profileId)
                .icon(dto.getIcon())
                .name(dto.getName())
                .amount(dto.getAmount())
                .date(dto.getDate())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .type("expense")
                .build();
    }
}
