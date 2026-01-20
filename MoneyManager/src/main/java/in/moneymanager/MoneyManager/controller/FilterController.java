package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.dto.ExpenseDTO;
import in.moneymanager.MoneyManager.dto.FilterDTO;
import in.moneymanager.MoneyManager.dto.IncomeDTO;
import in.moneymanager.MoneyManager.service.ExpenseService;
import in.moneymanager.MoneyManager.service.IncomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/filter")
public class FilterController {
    private final IncomeService incomeService;
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> filterTransaction(@RequestBody FilterDTO filterDTO){
        LocalDate startDate = filterDTO.getStartDate() != null ? filterDTO.getStartDate() : LocalDate.MIN;
        LocalDate endDate = filterDTO.getEndDate() != null ? filterDTO.getEndDate() : LocalDate.now();
        String keyword = filterDTO.getKeyword() != null ? filterDTO.getKeyword() : "";
        String sortField = filterDTO.getSortField() != null ? filterDTO.getSortField() : "date";
        Sort.Direction direction = "desc".equalsIgnoreCase(filterDTO.getSortOrder()) ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction,sortField);
        if("income".equalsIgnoreCase(filterDTO.getType())){
            List<IncomeDTO> incomes = incomeService.filterIncomes(startDate,endDate,keyword,sort);
            return ResponseEntity.status(HttpStatus.OK).body(incomes);
        }
        else if("expense".equalsIgnoreCase(filterDTO.getType())){
            List<ExpenseDTO> expense = expenseService.filterExpenses(startDate,endDate,keyword,sort);
            return ResponseEntity.status(HttpStatus.OK).body(expense);
        }
        else{
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Type. Must be an 'income' or 'expense'");
        }
    }
}
