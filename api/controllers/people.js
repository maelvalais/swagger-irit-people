"use strict";
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require("util");
const axios = require("axios"); // for http-ing
const querystring = require("querystring"); // for data url-encoding
require("axios-debug-log"); // use DEBUG=axios for tracing POST/GET requests
const cheerio = require("cheerio"); // for web scraping

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
  people: people_api
};

/*
  Functions in a127 controllers used for operations should take two parameters:

  Param 1: a handle to the request object
  Param 2: a handle to the response object
 */
function people_api(req, res) {
  // variables defined in the Swagger document can be referenced using req.swagger.params.{parameter_name}
  var name = req.swagger.params.name.value || "stranger";
  getList()
    .then(l => res.json(l))
    .catch(error =>
      res.json({
        message: error.toString()
      })
    );
  // this sends back a JSON response which is a single string
}

const getList = async () => {
  return await axios({
    method: "post",
    url: "https://www.irit.fr/spip.php?page=annuaire&lang=fr",
    // Payload must be in form-data (axios sends application/json by default)
    // which means we must use querystring to urlify and encode.
    data: querystring.stringify({
      op1: 3, // contains operator
      nom_form: "a",
      op2: 3, // contains operator
      prenom_form: "",
      submit: "Rechercher/ Search", // mandatory
      lang: "fr" // mandatory
    })
  }).then(resp => {
    var people = [];
    const $ = cheerio.load(resp.data);
    $("#texte_gauche > center:nth-child(10) > table > tbody > tr")
      .slice(1) // first row only contains useless table headers
      .each((_, tr) => {
        const td = $(tr).find("td");
        people.push({
          name: td.eq(0).text(),
          number: td.eq(1).text(),
          location: td.eq(2).text(),
          email: td
            .eq(3)
            .text()
            .replace(" at ", "@")
        });
      });
    return people;
  });
  // .catch(err => {
  //   err;
  // });
};
