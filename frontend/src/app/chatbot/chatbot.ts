import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Property as PropertyService } from '../services/property';
import { Property as PropertyModel } from '../models/property';


interface ChatMessage {
  sender: 'user' | 'bot';
  text?: string;
  properties?: PropertyModel[];
  showViewAll?: boolean;
}


@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css'
})


export class Chatbot implements OnInit {

  isOpen = false;

  userMessage = '';

  properties: PropertyModel[] = [];

  isLoadingProperties = false;


  messages: ChatMessage[] = [

    {
      sender: 'bot',
      text:
        'Hi! 👋 Welcome to PrimeHomes Assistant. I can help you find properties by location, BHK, property type and budget.'
    }

  ];


  constructor(
    private propertyService: PropertyService,
    public router: Router
  ) {}


  ngOnInit(): void {

    this.loadProperties();

  }


  // ==========================================
  // Load Real Properties
  // ==========================================

  loadProperties(): void {

    this.isLoadingProperties = true;

    this.propertyService
      .getProperties()
      .subscribe({

        next: (data) => {

          this.properties = data;

          this.isLoadingProperties = false;

          console.log(
            'Chatbot Properties:',
            this.properties
          );

        },

        error: (error) => {

          console.error(
            'Chatbot property loading error:',
            error
          );

          this.isLoadingProperties = false;

        }

      });

  }


  // ==========================================
  // Open / Close Chat
  // ==========================================

  toggleChat(): void {

    this.isOpen = !this.isOpen;

  }


  // ==========================================
  // Send Message
  // ==========================================

  sendMessage(): void {

    const message =
      this.userMessage.trim();

    if (!message) {

      return;

    }


    this.messages.push({

      sender: 'user',

      text: message

    });


    this.userMessage = '';


    this.generateResponse(message);

  }


  // ==========================================
  // Quick Buttons
  // ==========================================

  sendQuickMessage(
    message: string
  ): void {

    this.userMessage = message;

    this.sendMessage();

  }


  // ==========================================
  // View Property Details
  // ==========================================

  viewProperty(
    propertyId: number
  ): void {

    this.toggleChat();

    this.router.navigate([
      '/properties',
      propertyId
    ]);

  }


  // ==========================================
  // View All Properties
  // ==========================================

  viewAllProperties(): void {

    this.toggleChat();

    this.router.navigate([
      '/properties'
    ]);

  }


  // ==========================================
  // Generate Response
  // ==========================================

  generateResponse(
    message: string
  ): void {

    const lowerMessage =
      message.toLowerCase();


    // ==========================================
    // Check Loading
    // ==========================================

    if (this.isLoadingProperties) {

      this.messages.push({

        sender: 'bot',

        text:
          'Please wait a moment while I load the latest PrimeHomes properties. 🏠'

      });

      return;

    }


    // ==========================================
    // Check Properties
    // ==========================================

    if (this.properties.length === 0) {

      this.messages.push({

        sender: 'bot',

        text:
          'I could not load the property listings right now. Please try again in a moment.'

      });

      return;

    }


    // ==========================================
    // Greeting
    // ==========================================

    if (

      lowerMessage.includes('hello') ||

      lowerMessage.includes('hi') ||

      lowerMessage.includes('hey')

    ) {

      this.messages.push({

        sender: 'bot',

        text:
          'Hello! 👋 Tell me what type of property you are looking for. For example: "Show me 2 BHK properties in Hyderabad."'

      });

      return;

    }


    // ==========================================
    // Start With All Properties
    // ==========================================

    let results =
      [...this.properties];


    // ==========================================
    // Location / City
    // ==========================================

    const availableCities = Array.from(
      new Set(
        this.properties
          .map(property =>
            property.city?.trim().toLowerCase()
          )
          .filter(city => !!city)
      )
    );


    const matchedCity =
      availableCities.find(city =>
        lowerMessage.includes(city)
      );


    if (matchedCity) {

      results =
        results.filter(property =>
          property.city
            ?.trim()
            .toLowerCase() === matchedCity
        );

    }


    // ==========================================
    // Detect Unknown Location
    // ==========================================

    const locationMatch =
      lowerMessage.match(
        /(?:in|at|near|around)\s+([a-zA-Z\s]+?)(?:\s+(?:under|below|less than|upto|up to|\d+\s*(?:bhk|bedroom|bedrooms)|apartment|apartments|flat|flats|villa|villas|house|houses|home|homes|plot|plots)|$)/i
      );


    if (
      locationMatch &&
      !matchedCity
    ) {

      const requestedLocation =
        locationMatch[1].trim();


      this.messages.push({

        sender: 'bot',

        text:
          `🔎 Sorry, PrimeHomes currently has no properties available in "${requestedLocation}". Please try another location from our available listings.`

      });

      return;

    }


    // ==========================================
    // BHK / Bedroom Detection
    // ==========================================

    let requestedBhk: number | null = null;


    // Examples:
    // 2 BHK
    // 2bhk
    // 2 bedroom
    // 2 bedrooms

    const numericBhkMatch =
      lowerMessage.match(
        /(\d+)\s*(?:bhk|bedroom|bedrooms)/
      );


    if (numericBhkMatch) {

      requestedBhk =
        Number(numericBhkMatch[1]);

    }


    // Natural language bedroom numbers

    const bedroomWords: {
      [key: string]: number
    } = {

      'one bedroom': 1,
      'one bedrooms': 1,

      'two bedroom': 2,
      'two bedrooms': 2,

      'three bedroom': 3,
      'three bedrooms': 3,

      'four bedroom': 4,
      'four bedrooms': 4,

      'five bedroom': 5,
      'five bedrooms': 5

    };


    if (!requestedBhk) {

      for (
        const phrase of Object.keys(bedroomWords)
      ) {

        if (
          lowerMessage.includes(phrase)
        ) {

          requestedBhk =
            bedroomWords[phrase];

          break;

        }

      }

    }


    if (requestedBhk) {

      results =
        results.filter(property =>
          property.bhk === requestedBhk
        );

    }


    // ==========================================
    // Property Type Detection
    // ==========================================

    let requestedPropertyType:
      string | null = null;


    // Apartment / Flat

    if (

      lowerMessage.includes('apartment') ||

      lowerMessage.includes('apartments') ||

      lowerMessage.includes('flat') ||

      lowerMessage.includes('flats')

    ) {

      requestedPropertyType =
        'apartment';

    }


    // Villa

    else if (

      lowerMessage.includes('villa') ||

      lowerMessage.includes('villas')

    ) {

      requestedPropertyType =
        'villa';

    }


    // House / Home

    else if (

      lowerMessage.includes('house') ||

      lowerMessage.includes('houses') ||

      lowerMessage.includes('home') ||

      lowerMessage.includes('homes') ||

      lowerMessage.includes('independent house')

    ) {

      requestedPropertyType =
        'house';

    }


    // Plot

    else if (

      lowerMessage.includes('plot') ||

      lowerMessage.includes('plots')

    ) {

      requestedPropertyType =
        'plot';

    }


    if (requestedPropertyType) {

      results =
        results.filter(property =>
          property.propertyType
            ?.toLowerCase()
            .includes(
              requestedPropertyType!
            )
        );

    }


    // ==========================================
    // Budget Detection
    // ==========================================

    let minimumBudget:
      number | null = null;

    let maximumBudget:
      number | null = null;


    // ==========================================
    // Convert Budget To Rupees
    // ==========================================

    const convertBudgetToRupees = (
      amount: number,
      unit: string
    ): number => {

      const normalizedUnit =
        unit.toLowerCase();


      if (

        normalizedUnit === 'lakh' ||

        normalizedUnit === 'lakhs' ||

        normalizedUnit === 'lac' ||

        normalizedUnit === 'lacs' ||

        normalizedUnit === 'l'

      ) {

        return amount * 100000;

      }


      if (

        normalizedUnit === 'crore' ||

        normalizedUnit === 'crores' ||

        normalizedUnit === 'cr'

      ) {

        return amount * 10000000;

      }


      return amount;

    };


    // ==========================================
    // Budget Range
    // Example:
    // between 50 lakhs and 1 crore
    // ==========================================

    const budgetRangeMatch =
      lowerMessage.match(
        /between\s+(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)\s+and\s+(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)/
      );


    if (budgetRangeMatch) {

      minimumBudget =
        convertBudgetToRupees(
          Number(budgetRangeMatch[1]),
          budgetRangeMatch[2]
        );


      maximumBudget =
        convertBudgetToRupees(
          Number(budgetRangeMatch[3]),
          budgetRangeMatch[4]
        );

    }


    // ==========================================
    // Maximum Budget
    // ==========================================

    if (!budgetRangeMatch) {

      const maximumBudgetMatch =
        lowerMessage.match(
          /(?:under|below|less than|upto|up to)\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)/
        );


      if (maximumBudgetMatch) {

        maximumBudget =
          convertBudgetToRupees(
            Number(maximumBudgetMatch[1]),
            maximumBudgetMatch[2]
          );

      }

    }


    // ==========================================
    // Around Budget
    // ==========================================

    if (
      !budgetRangeMatch &&
      !maximumBudget
    ) {

      const aroundBudgetMatch =
        lowerMessage.match(
          /around\s*(?:₹\s*)?(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)/
        );


      if (aroundBudgetMatch) {

        const centerBudget =
          convertBudgetToRupees(
            Number(aroundBudgetMatch[1]),
            aroundBudgetMatch[2]
          );


        // Approximately ±10%

        minimumBudget =
          centerBudget * 0.9;

        maximumBudget =
          centerBudget * 1.1;

      }

    }


    // ==========================================
    // Apply Budget Filter
    // ==========================================

    if (

      minimumBudget !== null ||

      maximumBudget !== null

    ) {

      results =
        results.filter(property => {

          const price =
            property.price;


          if (

            minimumBudget !== null &&

            price < minimumBudget

          ) {

            return false;

          }


          if (

            maximumBudget !== null &&

            price > maximumBudget

          ) {

            return false;

          }


          return true;

        });

    }


    // ==========================================
    // No Results
    // ==========================================

    if (results.length === 0) {

      let searchSummary = '';


      if (matchedCity) {

        searchSummary +=
          ` in ${matchedCity}`;

      }


      if (requestedBhk) {

        searchSummary +=
          ` • ${requestedBhk} BHK`;

      }


      if (requestedPropertyType) {

        searchSummary +=
          ` • ${requestedPropertyType}`;

      }


      if (maximumBudget !== null) {

        searchSummary +=
          ` • Under ₹${maximumBudget.toLocaleString('en-IN')}`;

      }


      this.messages.push({

        sender: 'bot',

        text:
          `🔎 No exact matches found${searchSummary}.\n\n` +
          `I couldn't find a property matching all of your requirements.\n\n` +
          `You can try increasing your budget, changing the BHK, selecting another property type, or searching another location. 🏠`

      });


      return;

    }


    // ==========================================
    // Display Maximum 5 Properties
    // ==========================================

    const displayResults =
      results.slice(0, 5);


    // ==========================================
    // Result Summary
    // ==========================================

    this.messages.push({

      sender: 'bot',

      text:
        `🏠 I found ${results.length} matching ${
          results.length === 1
            ? 'property'
            : 'properties'
        }:`

    });


    // ==========================================
    // Property Cards
    // ==========================================

    this.messages.push({

      sender: 'bot',

      properties: displayResults,

      showViewAll:
        results.length > 5

    });

  }

}