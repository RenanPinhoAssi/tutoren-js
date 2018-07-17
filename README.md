# tutoren

> **-- Starting:**

	  
	  tutoren.startTour(tour_object,anchor_identifier);
  
  **tour_array**: Array of objects, each object will describe an step of your tutorial;
  anchor_identifier: Where tutorial will run;

> **-- Options:**

  **target**:         "Target_identifier",
   

     --- Target_identifier: An reference element to popover window position    
    
    
  **popover:**        "Align_Y_Axys Align_X_Axys Offset_Y_Axys Offset_X_Axys", 
  
    --- Align_Y_Axys:  (top,center,bottom)
    --- Align_X_Axys:  (left,center,right)
    
    --- Offset_Y_Axys/Offset_X_Axys: Extra position adjust
    
    
  **effect**:         "Effect_1 Effect_2 Effect_n",
  
    --- Effects Avaiable:
          "highlight"     : Will highlight target element, also, the window will get darker.
          "link"          : Clicking will redirect user to new href and the tutorial will keep alive (need "button","href" and "root_href" parameters)
          "action"        : Clicking button will move tutorial forward(need "button" parameter)
          "button_effects": CSS Effects applied on button
           Custom_Class   : You can use you own CSS class
           
    
  **slide**:          duration,
  
  **scroll**:         duration,
  
    --- slide:  Popover will slide to new position
    --- scroll: Popover will appear in new position and the window will be smart-scrolled to the new target position
    --- duration: Time in milliseconds
  
  **title**:          "String",
  
  **text**:           "String",
  
  **arrows**:         "hidden"
  
    --- Disable arrows on popover
    

> **-- Usage Example:**

    var anchor = "#main_window";
    var tourPlan = [
    	 {
    	     target:         "#menu-item-0",
    	     effect:         "highlight",
    	     popover:        "center right 0 0",
    	     slide:          1000,
    	     title:          "Step 1",
    	     text:           "Text step 1"
    	 },
    	 {
    	     target:         "#menu-item-1",
    	     effect:         "highlight action",
    	     button:         "#bt-0",
    	     button_effects: "focus-box", 
    	     popover:        "center right 0 0",
    	     slide:          1000,
    	     title:          "Step 2",
    	     text:           "Click there",
    	     arrows:         "hidden"
    	 },
    	 {
    	     target:         "#menu-item-2",
    	     effect:         "highlight link",
    	     href:           "#!/main_link",
    	     root_href:      "#!/sub_link_page",
    	     button:         "#bt-1",
    	     button_effects: "focus-box", 
    	     popover:        "center right 10 0",
    	     scroll:          1000,
    	     title:          "Step 3",
    	     text:           "Click here",
    	     arrows:         "hidden"
        	 }
        ]
            
    tutoren.startTour(tourPlan,anchor);  
       
