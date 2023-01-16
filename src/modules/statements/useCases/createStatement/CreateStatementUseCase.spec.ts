import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementError } from "./CreateStatementError"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let createStatementUseCase: CreateStatementUseCase

describe('Create Statements', () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
  })

  it('should be able to create a new statement', async () => {

    const user = await createUserUseCase.execute({
      name: 'Artur Minelli',
      email: 'arturminelli@gmail.com',
      password: 'lufaardala'
    })

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100000,
      description: 'I won the lottery'
    })

    expect(statement).toHaveProperty('id')

  })

  it('should not be able to create a new statement if user does not exist', async () => {

    expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: 'non_existing_id',
        type: OperationType.DEPOSIT,
        amount: 100000,
        description: 'I won the lottery'
      })

      expect(statement).toHaveProperty('id')
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)

  })

  it("should not be able to withdraw an amount greater than the account's balance", async () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

      const statement = await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 100000,
        description: 'I won the lottery'
      })

      expect(statement).toHaveProperty('id')
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)

  })

})
