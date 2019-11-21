Handlebars.registerHelper("each", function(passedString) {
  var theString = passedString.substring(0, 16);
  return new Handlebars.SafeString(theString);
});
