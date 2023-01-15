import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

import dotenv from 'dotenv'
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError"

dotenv.config()

let usersRepository: IUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase

describe('Authenticate User', () => {

  beforeEach(() => {
    jest.resetModules()

    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it('should be able to authenticate a user', async () => {

    await createUserUseCase.execute({
      name: 'Artur Minelli',
      email: 'arturminelli@gmail.com',
      password: 'lufaardala',
    })

    const tokenResponse = await authenticateUserUseCase.execute({
      email: 'arturminelli@gmail.com',
      password: 'lufaardala',
    })

    expect(tokenResponse).toHaveProperty('user')

    expect(tokenResponse).toHaveProperty('token')

    expect(tokenResponse.token).toBeTruthy()
  })

  it('should not be able to authenticate a user if the user does not exist', async () => {

    expect(async () => {
      const tokenResponse = await authenticateUserUseCase.execute({
        email: 'arturminelli@gmail.com',
        password: 'lufaardala',
      })

      expect(tokenResponse).toHaveProperty('user')

      expect(tokenResponse).toHaveProperty('token')

      expect(tokenResponse.token).toBeTruthy()
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)

  })

  it('should not be able to authenticate a user if password does not match', async () => {

    expect(async () => {
      await createUserUseCase.execute({
        name: 'Artur Minelli',
        email: 'arturminelli@gmail.com',
        password: 'lufaardala',
      })

      const tokenResponse = await authenticateUserUseCase.execute({
        email: 'arturminelli@gmail.com',
        password: 'wrong_password',
      })

      expect(tokenResponse).toHaveProperty('user')

      expect(tokenResponse).toHaveProperty('token')

      expect(tokenResponse.token).toBeTruthy()
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)

  })

})
