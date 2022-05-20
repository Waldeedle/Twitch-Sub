#  Basic Credit Card Processor
-----
##  An overview of the design
The design is very simple due to the constraints presented.
No need to suss out edge cases, or look for tricks. It's a very simple programming test.
This led to the decision to contain all the functions and classes in the myprogram.php file rather than seperating them as per best practices. 

The script was constrained to run using a terminal and due to this there is no default filename specified or an echo to alert the user when a filename is not provided.
The script does ensure that the provided filename is actually an existing text file that can be processed, line by line.
The program splits the string being read by the space delimiters as that is a defined constraint for the input text file.
The last argument is always going to be a dollar amount (no decimals), hence the program uses a regular expression to filter out anything but an integer value for the last argument.
The program checks the first argument for the type of command the user is trying to process. 

The program allows for 3 types of commands: Add, Charge, and Credit.
For Add, the program uses the Luhn 10 validator to check whether or not the credit card being initialized is a valid entry and if it is not returns the string "error". Otherwise a card object is initialized with a balance of $0. It should be noted that this design follows the constraint that a single name will only be used once to add a card, and thus a key-value pair data structure is used. It should be noted that the number has to be input as a string for the Luhn 10 validator.

To allow for multiple cards under a user, a multidimensional array would be appropriate where the next level is the card number ($user[name][cardnumber] => card Object). This would allow for duplicate card numbers but would not allow for users to have the same name (hopefully there is only 1 Tom).

For Charge, the program will increase the balance of the card belonging to the specified user as long as the credit card number was a valid per Luhn 10 and that the amount being charged would not put the user over their credit limit (no validation of the credit card number is done, a good idea to require that information be passed and validated).

For Credit, the program will decrease the balance of the card belonging to the specified user as long as the credit card number was a valid per Luhn 10 and it is credited even if the balance would drop below $0 i.e a negative balance is allowed.

After processing all of the input, the program will close the open filestream and send the generated array of users and their card objects to a summary generator function. The function alphabetically sorts the array of users and then starts to generate a string using the given format.
The output starts the string with ```\n and then iterates through the user array. It adds the name of the card holder with a colon and space followed by either their card balance or the string "error" if the card object did not get created due to an invalid card number as per Luhn 10. This is then followed by a new line character. Once the program has iterated through the array of users then the output is returned with a ```\n concatenated at the end.

The unit tests were also relatively straight-forward as the functions and classes were simplistic in nature due to the requirements presented. I would seperate out the test cases by some defined structure for more clarity when navigating the repo, potentially as testCardClass, testNumberProcessing (would make a centralized class for any custom functions to do with numbers), and testSummaryGenerator.

## How to run the code and tests
The program is meant to be run using a terminal.

To run the myprogram.php file, a filename has to be passed as a command line argument as shown below:
  - php myprogram.php YOURFILENAME.txt
  
The txt file must follow a specific format and is case sensitive.
The program allows for 3 types of commands: Add, Charge, and Credit.
A user must be added with a valid Luhn 10 credit card number prior to using the Charge or Credit commands.
After the command word, a space delimiter is placed followed by the name of the card holder.
After the card holder name, a space delimiter is placed followed by the the appropriate arguments
delimited by spaces.
For the command Add, the arguments are: a credit card number (up to 19 characters) and a credit limit for the card. 
For the command Charge, the argument is: the amount to be charged.
For the command Credit, the argument is: the amount to be credited.
It should be noted that if a credit card number is not a valid luhn 10 number, it will not be created and any charge or credit will not be processed.

An example of a valid input file is shown below:
```
Add Tom 4111111111111111 $1000
Add Lisa 5454545454545454 $3000
Add Quincy 1234567890123456 $2000
Charge Tom $500
Charge Tom $800
Charge Lisa $7
Credit Lisa $100
Credit Quincy $200
```
This will result in the following output:
```
Lisa: $-93
Quincy: error
Tom: $500
```

To run the PHPUnit tests in mytest.php file, simply enter the following into the command line:
  - phpunit mytest.php
