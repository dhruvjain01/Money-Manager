package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.dto.ExpenseDTO;
import in.moneymanager.MoneyManager.dto.IncomeDTO;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import java.util.stream.IntStream;

@Service
public class ExcelService {

    public void writeIncomesToExcel(OutputStream os, List<IncomeDTO> incomes) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Incomes");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("S.No");
            header.createCell(1).setCellValue("Date");
            header.createCell(2).setCellValue("Name");
            header.createCell(3).setCellValue("Category");
            header.createCell(4).setCellValue("Amount");
            IntStream.range(0, incomes.size())
                    .forEach(index -> {
                        IncomeDTO income = incomes.get(index);
                        Row row = sheet.createRow(index+1);
                        row.createCell(0).setCellValue(index+1);
                        row.createCell(1).setCellValue(income.getDate()!=null ? income.getDate().toString() : "N/A");
                        row.createCell(2).setCellValue(income.getName()!=null ? income.getName() : "N/A");
                        row.createCell(3).setCellValue(income.getCategoryId()!=null ? income.getCategoryName() : "N/A");
                        row.createCell(4).setCellValue(income.getAmount()!=null ? income.getAmount().doubleValue() : 0);
                    });
            workbook.write(os);
        }
        catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate income excel report");
        }
    }

    public void writeExpensesToExcel(OutputStream os, List<ExpenseDTO> expenses) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Expenses");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("S.No");
            header.createCell(1).setCellValue("Date");
            header.createCell(2).setCellValue("Name");
            header.createCell(3).setCellValue("Category");
            header.createCell(4).setCellValue("Amount");
            IntStream.range(0, expenses.size())
                    .forEach(index -> {
                        ExpenseDTO expense = expenses.get(index);
                        Row row = sheet.createRow(index+1);
                        row.createCell(0).setCellValue(index+1);
                        row.createCell(1).setCellValue(expense.getDate()!=null ? expense.getDate().toString() : "N/A");
                        row.createCell(2).setCellValue(expense.getName()!=null ? expense.getName() : "N/A");
                        row.createCell(3).setCellValue(expense.getCategoryId()!=null ? expense.getCategoryName() : "N/A");
                        row.createCell(4).setCellValue(expense.getAmount()!=null ? expense.getAmount().doubleValue() : 0);
                    });
            workbook.write(os);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate expense excel report");
        }
    }
}
