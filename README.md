# Niddah-Calculator
Google Apps Script code to calculate events relevant to the Niddah Cycle. Made to work with Google Calendar

This code will generate the three vestos (vest bainonis, vest hachodesh, and vest haflaga), an ohr zaruah event for the 12 hours before a vest, 14 bedika reminders and a mikva night event. It does not account for any other chumros.

How to use: There are four events you can enter: Day Period, Night Period, Hefsek Tahara, and Remove Hefsek Tahara. Correct spelling is essential. Create the events in Google calender on the day they happened (if her peiord began on the day of April 9, go to April 9 and create an event called "Day Period". If she got a hefsek tahara on April 16, create an event on April 16 called "Hefsek Tahara". If a bedikah was found to be tamei, you can use the "Remove Hefsek Tahara" to remove the previously-created events. For night, enter the Night Period on the calender night of when the period started, so if period was on Halachic Wedndeday Night, still put it on Tuesday Night (Wednesday Night will be halachichly Thursday, and will be day 2 of the count).

Note - This code will not create event for future dates, nor for dates more than seven days from today
