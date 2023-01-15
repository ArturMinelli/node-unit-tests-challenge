import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { IUsersRepository } from '../../repositories/IUsersRepository'
import { CreateUserError } from './CreateUserError'
import { CreateUserUseCase } from './CreateUserUseCase'

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User', () => {

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
  })

  it('should be able to create a new user', async () => {
    const user = await createUserUseCase.execute({
      name: 'Artur Minelli',
      email: 'arturminelli@gmail.com',
      password: 'lufaardala'
    })

    expect(user).toHaveProperty('id')
  })

  it('should not be able to create a new user if email already exists', async () => {

    expect(async () => {
      await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })

      await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala'
      })
    }).rejects.toBeInstanceOf(CreateUserError)

  })

})
