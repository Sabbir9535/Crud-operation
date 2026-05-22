import express, {json, Request,Response} from "express"
import { Pool, Result} from "pg"
import dotenv from "dotenv"
import path from "path"
import cors from "cors"

dotenv.config({path: path.join(process.cwd(), ".env")})

const app = express();
const port = 5000;

//parser
app.use(express.json())
app.use(cors());

//DB
const pool = new Pool({
    connectionString:`${process.env.CONNECTION_STR}`
})

const initDB = async()=>{
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address  TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )

        `);

      await pool.query(`
            CREATE TABLE IF NOT EXISTS todos(
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            descriptoin TEXT,
            completed BOOLEAN DEFAULT false,
            due_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
        
        `)
};

initDB();

app.get('/', (req:Request, res:Response) => {
  res.send('Hello Sabbir');
});


//users CRUD
app.post("/users", async (req:Request, res:Response)=>{
    const {name , email} = req.body;

try{
const result = await pool.query(`INSERT INTO users(name, email) VALUES($1, $2) RETURNING *`,[name,email])
res.status(201).json({
        success:true,
        message:"message send",
        data:result.rows[0]
    })
}catch(err:any){
res.status(500).json({
    success:false,
    message:err.message
})
}
    
 
})

app.get("/users", async (req:Request, res:Response)=>{
try{
const result = await pool.query(`
    SELECT * FROM users
    `)
res.status(200).json({
    success:true,
    massage:"user geted",
    data:result.rows
})
}catch(err:any){
res.status(500).json({
    success:false,
    message: err.message,
    datails: err
})
}
})
 
//get single user
app.get("/users/:id", async(req:Request , res:Response)=>{
   try{
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [req.params.id]);
    if(result.rows.length === 0){
        res.status(404).json({
             success:false,
             message: "not found result"
        })
    }
    else{
        res.status(200).json({
            success:true,
            message:"fond succesfully",
            data:result.rows[0]
        })
    }
   }catch(err:any){
    res.status(500).json({
    success:false,
    message: err.message,
    datails: err
})
   }
})

// update 
app.put("/users/:id", async (req: Request, res: Response) => {
  try {

    const { name, email } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           email = $2
       WHERE id = $3
       RETURNING *`,
      [name, email, Number(req.params.id)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: result.rows[0],
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
      details: err,
    });
  }
});


app.delete("/users/:id", async(req:Request , res:Response)=>{
   try{
    const result = await pool.query('DELETE  FROM users WHERE id=$1', [req.params.id]);
    if(result.rows.length === 0){
        res.status(404).json({
             success:true,
             message: "delete succesfully"
        })
    }
    else{
        res.status(200).json({
            success:true,
            message:"fond succesfully",
            data:null
        })
    }
   }catch(err:any){
    res.status(500).json({
    success:false,
    message: err.message,
    datails: err
})
   }
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});