export interface DomainEvent<TPayload = unknown> {
  type: string;
  payload: TPayload;
}

export class AccountCreatedEvent
  implements DomainEvent<{ accountName: string; accountId?: string }>
{
  type = "AccountCreated";
  constructor(public payload: { accountName: string; accountId?: string }) {}
}

export class AccountDeletedEvent
  implements DomainEvent<{ accountName: string; accountId?: string }>
{
  type = "AccountDeleted";
  constructor(public payload: { accountName: string; accountId?: string }) {}
}

export class CategoryCreatedEvent
  implements DomainEvent<{ categoryName: string; categoryId?: string }>
{
  type = "CategoryCreated";
  constructor(public payload: { categoryName: string; categoryId?: string }) {}
}

export class CategoryDeletedEvent
  implements DomainEvent<{ categoryName: string; categoryId?: string }>
{
  type = "CategoryDeleted";
  constructor(public payload: { categoryName: string; categoryId?: string }) {}
}
