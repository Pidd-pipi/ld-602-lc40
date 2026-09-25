package com.generated.rescueStock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

// 演示环境后端使用内存存储（com.generated.rescueStock.repositories），暂不接入数据源
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class })
public class RescueStockApplication {
  public static void main(String[] args) { SpringApplication.run(RescueStockApplication.class, args); }
}
