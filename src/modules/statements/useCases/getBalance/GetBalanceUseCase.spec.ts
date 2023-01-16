import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetBalanceError } from "./GetBalanceError"
import { GetBalanceUseCase } from "./GetBalanceUseCase"

let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let createStatementsUseCase: CreateStatementUseCase
let getBalanceUseCase: GetBalanceUseCase

describe('Get Balance', () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementsUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
  })

  it("should be able to get the balance of an user's account", async () => {
    const user = await createUserUseCase.execute({
      name: 'Artur Minelli',
      email: 'arturminelli@gmail.com',
      password: 'lufaardala'
    })

    const user_id = user.id as string

    const deposit = 10000
    const withdraw = 5000

    await createStatementsUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: deposit,
      description: 'Won the lottery',
    })

    await createStatementsUseCase.execute({
      user_id,
      type: OperationType.WITHDRAW,
      amount: withdraw,
      description: 'Buy a new fridge',
    })

    const balanceResponse = await getBalanceUseCase.execute({
      user_id
    })

    const { balance, statement } = balanceResponse

    expect(balance).toBe(deposit - withdraw)

    expect(statement.length).toBe(2)
  })

  it('should not be able to get the balance if user does not exist', () => {

    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: 'non_existing_id'
      })
    }).rejects.toBeInstanceOf(GetBalanceError)

  })

})
