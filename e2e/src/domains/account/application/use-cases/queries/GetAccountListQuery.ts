import { UseCase } from "../../../../../shared/application/UseCase";
import { AccountRepository } from "../../../domain/repositories/AccountRepository";
import {
  GetAccountListRequest,
  GetAccountListResponse,
} from "../dto/GetAccountListDto";

export class GetAccountListQuery
  implements UseCase<GetAccountListRequest, GetAccountListResponse>
{
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(
    request: GetAccountListRequest
  ): Promise<GetAccountListResponse> {
    try {
      const accounts = await this.accountRepository.findAll({
        limit: request.limit,
        offset: request.offset,
        filter: request.filter,
      });

      const totalBalance = accounts.reduce(
        (sum, account) => sum + account.initialBalance,
        0
      );

      return {
        success: true,
        accounts: accounts.map((account) => ({
          id: account.id,
          accountName: account.accountName,
          accountType: account.accountType,
          balance: account.initialBalance,
          currency: account.currency,
          description: account.description,
        })),
        totalBalance,
        totalCount: accounts.length,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: "unknown",
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
