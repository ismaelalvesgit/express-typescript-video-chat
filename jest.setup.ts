//@Author ismael alves
import dotenv from 'dotenv';
import app from './src'
dotenv.config({path: '.env.test'})

beforeAll( async()=>{
    console.log(app)
})

afterAll( async()=>{
    
})

