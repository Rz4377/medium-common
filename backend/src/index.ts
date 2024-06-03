import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from 'hono/jwt'

// create main hono app

type bindings = {
  DATABASE_URL : string 
  JWT_SECRET : string 
}

const app = new Hono<{
  Bindings:bindings
}>()


app.post('api/v1/signup', async (c) => {

    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    console.log(body)

    try {
      const user = await prisma.user.create({
        data : {
          email: body.email,
          password: body.password
        }
      });
      console.log("user",user);
      console.log("no issue till here");
      console.log("JWT_SECRET",c.env.JWT_SECRET);
      const jwt = await sign({id:user.id} , c.env.JWT_SECRET);

      return c.json({
        jwt:jwt
      })
    } catch(error){
      return c.json({
        error:error
      })
    }
      
})


export default app;
