import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../../users/repositories/IUsersRepository"
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase"
import { GetStatementOperationError } from "./GetStatementOperationError"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"

let statementsRepository: IStatementsRepository
let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let createStatementsUseCase: CreateStatementUseCase
let getStatementOperationUseCase: GetStatementOperationUseCase

describe('Get Statement Operation', () => {

  beforeEach(() => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    createStatementsUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)
  })

  it('should be able to get a statement operation from a given user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Artur Minelli',
      email: 'arturminelli@gmail.com',
      password: 'lufaardala'
    })

    const user_id = user.id as string

    const statement = await createStatementsUseCase.execute({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: 'Won the lottery'
    })

    const statement_id = statement.id as string

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    })

    expect(statementOperation).toHaveProperty('id')

    expect(statementOperation).toMatchObject({
      user_id,
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: 'Won the lottery'
    })
  })

  it('should not be able to get a statement operation if user does not exist', () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

      const user_id = user.id as string

      const statement = await createStatementsUseCase.execute({
        user_id,
        type: OperationType.DEPOSIT,
        amount: 10000,
        description: 'Won the lottery'
      })

      const statement_id = statement.id as string

      await getStatementOperationUseCase.execute({
        user_id: 'non_existing_user_id',
        statement_id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)

  })

  it('should not be able to get a statement operation if statement does not exist', () => {

    expect(async () => {
      const user = await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

      const user_id = user.id as string

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'non_existing_statement_id'
      })

    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)

  })

})
