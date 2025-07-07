package com.personal.money.management.core.account.infrastructure.persistence;

import com.personal.money.management.core.account.domain.model.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AccountMapper {

    // Use @Mapping annotations for better control
    @Mapping(target = "id", source = "id")
    @Mapping(target = "accountName", source = "accountName")
    @Mapping(target = "initBalance", source = "initBalance")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "currency", source = "currency")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "active", source = "active")
    AccountEntity toEntity(Account account);

    // Custom method for domain reconstruction
    default Account toDomain(AccountEntity entity) {
        if (entity == null) {
            return null;
        }
        return Account.reconstruct(
                entity.getId(),
                entity.getAccountName(),
                entity.getInitBalance(),
                entity.getType(),
                entity.getCurrency(),
                entity.getDescription(),
                entity.isActive()
        );
    }

    // Batch conversion methods
    List<Account> toDomainList(List<AccountEntity> entities);
    List<AccountEntity> toEntityList(List<Account> accounts);
}