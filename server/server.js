const express = require('express');
const path = require('path');
//import apollo server
const { ApolloServer } = require('apollo-server-express');
//import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schema');
const { authMiddleware } = require('./utils/auth');

//adding db connection 
const db = require('./config/connection');
const exp = require('constants');

//express server
const app = express();
const PORT = process.env.PORT || 3001;

//apollo server
const server = new ApolloServer ({
  typeDefs,
  resolvers,
  context: authMiddleware
});

//apply apollo server with express app
server.applyMiddleware({app});

//middleware parsing 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//if using production environment, serve client/build as static assets
if(process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//get all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`);
  })
})