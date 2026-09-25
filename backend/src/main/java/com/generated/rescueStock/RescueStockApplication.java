package com.generated.rescueStock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

// 演示环境使用内存仓储，禁用数据源/JPA 自动装配即可无数据库启动；
// 接入真实 MySQL 时移除下面的 exclude 并补充 application.properties。
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class })
public class RescueStockApplication {
  public static void main(String[] args) { SpringApplication.run(RescueStockApplication.class, args); }
}
