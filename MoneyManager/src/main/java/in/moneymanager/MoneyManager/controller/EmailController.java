package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.service.*;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/email")
public class EmailController {

    private final ExcelService excelService;
    private final EmailService emailService;
    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final ProfileService profileService;

    @PostMapping("/income-excel")
    public ResponseEntity<Void> emailIncomeExcel() throws IOException, MessagingException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        excelService.writeIncomesToExcel(byteArrayOutputStream,incomeService.getCurrentMonthIncomesForCurrentUser());
        emailService.sendEmailWithAttachment(profile.getEmail(),
                "Your Income Report",
                "Please find attached your income report.",
                byteArrayOutputStream.toByteArray(),
                "income.xlsx");
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PostMapping("/expense-excel")
    public ResponseEntity<Void> emailExpenseExcel() throws IOException, MessagingException {
        ProfileEntity profile = profileService.getCurrentProfile();
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        excelService.writeExpensesToExcel(byteArrayOutputStream,expenseService.getCurrentMonthExpensesForCurrentUser());
        emailService.sendEmailWithAttachment(profile.getEmail(),
                "Your Expense Report",
                "Please find attached your expense report.",
                byteArrayOutputStream.toByteArray(),
                "expense.xlsx");
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }
}
