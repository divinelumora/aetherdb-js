// Basic test — run with: node test/basic.js
// Make sure AetherDB is running at localhost:8080

const BASE_URL = 'http://localhost:8080'

async function run() {
  console.log('Testing AetherDB JS SDK...\n')

  // 1. Health check
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json())
  console.log('Health:', health)

  // 2. Register
  const reg = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `sdk-test-${Date.now()}@test.com`, password: 'password123' })
  }).then(r => r.json())
  console.log('Register:', reg)

  // 3. Login
  const login = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: reg.email, password: 'password123' })
  }).then(r => r.json())
  console.log('Login: got token ✅')

  const token = login.access_token
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }

  // 4. Tenant info
  const info = await fetch(`${BASE_URL}/tenant/info`, { headers }).then(r => r.json())
  console.log('Tenant info:', info)

  // 5. Create table
  const table = await fetch(`${BASE_URL}/tenant/tables`, {
    method: 'POST', headers,
    body: JSON.stringify({
      name: 'sdk_test',
      columns: [
        { name: 'message', type: 'TEXT', nullable: false },
        { name: 'value', type: 'INTEGER', nullable: true }
      ]
    })
  }).then(r => r.json())
  console.log('Create table:', table)

  // 6. Insert
  const insert = await fetch(`${BASE_URL}/tenant/insert`, {
    method: 'POST', headers,
    body: JSON.stringify({ table: 'sdk_test', data: { message: 'Hello AetherDB!', value: 42 } })
  }).then(r => r.json())
  console.log('Insert:', insert)

  // 7. AI query
  const ai = await fetch(`${BASE_URL}/tenant/ai/query`, {
    method: 'POST', headers,
    body: JSON.stringify({ question: 'show all messages in sdk_test table' })
  }).then(r => r.json())
  console.log('AI query:', ai)

  console.log('\n✅ All tests passed!')
}

run().catch(console.error)
