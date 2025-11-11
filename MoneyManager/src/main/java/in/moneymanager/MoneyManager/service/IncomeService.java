package in.moneymanager.MoneyManager.service;

import in.moneymanager.MoneyManager.dto.ExpenseDTO;
import in.moneymanager.MoneyManager.dto.IncomeDTO;
import in.moneymanager.MoneyManager.entity.CategoryEntity;
import in.moneymanager.MoneyManager.entity.ExpenseEntity;
import in.moneymanager.MoneyManager.entity.IncomeEntity;
import in.moneymanager.MoneyManager.entity.ProfileEntity;
import in.moneymanager.MoneyManager.repository.CategoryRepository;
import in.moneymanager.MoneyManager.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {
    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileService profileService;

    public IncomeDTO addIncome(IncomeDTO incomeDTO){
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity category = categoryRepository.findById(incomeDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        IncomeEntity income = toEntity(incomeDTO,profile,category);
        income = incomeRepository.save(income);
        return toDTO(income);
    }

    public List<IncomeDTO> getCurrentMonthIncomesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());
        List<IncomeEntity> incomeList = incomeRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate);
        return incomeList.stream().map(this::toDTO).toList();
    }

    public void deleteIncome(Long incomeId){
        ProfileEntity profile = profileService.getCurrentProfile();
        IncomeEntity income = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Income not found"));
        if(!income.getProfile().getId().equals(profile.getId())){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Unauthorized to delete this income");
        }
        incomeRepository.delete(income);
    }

    public List<IncomeDTO> getLatest5IncomeForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> latest5incomes = incomeRepository.findTop5ByProfileIdOrderByDateDesc(profile.getId());
        return latest5incomes.stream().map(this::toDTO).toList();
    }

    public BigDecimal totalIncome() {
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = incomeRepository.findTotalIncomeByProfileId(profile.getId());
        return total != null ? total : BigDecimal.ZERO;
    }

    public List<IncomeDTO> filterIncomes(LocalDate startDate, LocalDate endDate, String keyword, Sort sort){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoringCase(
                profile.getId(), startDate, endDate, keyword, sort);
        return list.stream().map(this::toDTO).toList();
    }

    private IncomeEntity toEntity(IncomeDTO incomeDTO, ProfileEntity profile, CategoryEntity category){
        return IncomeEntity.builder()
                .name(incomeDTO.getName())
                .icon(incomeDTO.getIcon())
                .amount(incomeDTO.getAmount())
                .date(incomeDTO.getDate())
                .category(category)
                .profile(profile)
                .build();
    }

    private IncomeDTO toDTO(IncomeEntity entity){
        return IncomeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .amount(entity.getAmount())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getName() != null ? entity.getCategory().getName() : null)
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
