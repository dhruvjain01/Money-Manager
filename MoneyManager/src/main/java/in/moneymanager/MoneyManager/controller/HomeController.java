package in.moneymanager.MoneyManager.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/status","/health"})
public class HomeController {

    // creating a public endpoint to check if our application is running or not - kind of status check
    @GetMapping
    public String healthCheck(){
        return "Application is running fine!";
    }

}
