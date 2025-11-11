package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.dto.ExpenseDTO;
import in.moneymanager.MoneyManager.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/expenses")
public class ExpenseController {
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseDTO> addExpense(@RequestBody ExpenseDTO expenseDTO){
        ExpenseDTO savedExpense = expenseService.addExpense(expenseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }

    @GetMapping
    public ResponseEntity<List<ExpenseDTO>> getExpense(){
        List<ExpenseDTO> expenses = expenseService.getCurrentMonthExpensesForCurrentUser();
        return ResponseEntity.status(HttpStatus.OK).body(expenses);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long expenseId){
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.noContent().build();
    }
}
