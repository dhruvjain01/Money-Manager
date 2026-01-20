package in.moneymanager.MoneyManager.controller;

import in.moneymanager.MoneyManager.service.ExcelService;
import in.moneymanager.MoneyManager.service.ExpenseService;
import in.moneymanager.MoneyManager.service.IncomeService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/excel")
public class ExcelController {
    private final IncomeService incomeService;
    private final ExcelService excelService;
    private final ExpenseService expenseService;

    @GetMapping("/download/income")
    public void downloadIncomeExcel(HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        httpServletResponse.setHeader("Content-Disposition","attachment; filename=income.xlsx");
        excelService.writeIncomesToExcel(httpServletResponse.getOutputStream(),incomeService.getCurrentMonthIncomesForCurrentUser());
    }

    @GetMapping("/download/expense")
    public void downloadExpenseExcel(HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        httpServletResponse.setHeader("Content-Disposition","attachment; filename=expense.xlsx");
        excelService.writeExpensesToExcel(httpServletResponse.getOutputStream(), expenseService.getCurrentMonthExpensesForCurrentUser());
    }
}
