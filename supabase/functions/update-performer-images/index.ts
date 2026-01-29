import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive image mapping for performers
// Using Wikipedia and reliable public sources
const performerImageMap: Record<string, string> = {
  // ========== TOP ARTISTS ==========
  "21 Savage": "https://upload.wikimedia.org/wikipedia/commons/8/8f/21_Savage_2024_%28cropped%29.png",
  "Taylor Swift": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Taylor_Swift_at_the_2023_MTV_Video_Music_Awards_%284%29_%28cropped%29.png",
  "Beyonce": "https://upload.wikimedia.org/wikipedia/commons/1/17/Beyonc%C3%A9_at_The_Eras_Tour_in_Madrid_2.jpg",
  "Beyoncé": "https://upload.wikimedia.org/wikipedia/commons/1/17/Beyonc%C3%A9_at_The_Eras_Tour_in_Madrid_2.jpg",
  "Drake": "https://upload.wikimedia.org/wikipedia/commons/2/28/Drake_2010.jpg",
  "Kendrick Lamar": "https://upload.wikimedia.org/wikipedia/commons/3/32/Pulitzer2018-kendrick-lamar.jpg",
  "Travis Scott": "https://upload.wikimedia.org/wikipedia/commons/1/14/Travis_Scott_-_Openair_Frauenfeld_2019_08.jpg",
  "J. Cole": "https://upload.wikimedia.org/wikipedia/commons/b/b6/J._Cole_2023.png",
  "Post Malone": "https://upload.wikimedia.org/wikipedia/commons/e/e1/Post_Malone_2023.png",
  "Doja Cat": "https://upload.wikimedia.org/wikipedia/commons/7/79/Doja_Cat_2023.png",
  "SZA": "https://upload.wikimedia.org/wikipedia/commons/c/cd/SZA_-_Governors_Ball_2023.jpg",
  "Lizzo": "https://upload.wikimedia.org/wikipedia/commons/1/11/Lizzo_at_the_2022_Governors_Ball_%28cropped%29.jpg",
  "Megan Thee Stallion": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Megan_Thee_Stallion_2024.jpg",
  "Future": "https://upload.wikimedia.org/wikipedia/commons/0/0f/Future_the_rapper_performing_in_2023.jpg",
  "Lil Baby": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Lil_Baby_2020.png",
  "U2": "https://upload.wikimedia.org/wikipedia/commons/9/92/U2_360%C2%B0_Tour_2010-09-29.jpg",
  "Metallica": "https://upload.wikimedia.org/wikipedia/commons/4/40/Metallica_at_The_O2_Arena_London_2008.jpg",
  "The Rolling Stones": "https://upload.wikimedia.org/wikipedia/commons/d/d6/The_Rolling_Stones_in_Hyde_Park.jpg",
  "Rolling Stones": "https://upload.wikimedia.org/wikipedia/commons/d/d6/The_Rolling_Stones_in_Hyde_Park.jpg",
  "Sam Smith": "https://upload.wikimedia.org/wikipedia/commons/c/cc/Sam_Smith_Lollapalooza_2015.jpg",
  "Noah Kahan": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Noah_Kahan_Boston_Calling_2023.jpg",
  "Hozier": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Hozier_-_Rock_am_Ring_2019-5091.jpg",
  
  // ========== ADDITIONAL NOTABLE ARTISTS ==========
  "Cher": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Cher_in_2019.jpg",
  "Diana Ross": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Diana_Ross_2019.jpg",
  "Janet Jackson": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Janet_Jackson_2019.jpg",
  "Gwen Stefani": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Gwen_Stefani_2019.jpg",
  "Dolly Parton": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Dolly_Parton_2022.jpg",
  "Def Leppard": "https://upload.wikimedia.org/wikipedia/commons/5/58/Def_Leppard_2018.jpg",
  "Fleetwood Mac": "https://upload.wikimedia.org/wikipedia/commons/6/67/Fleetwood_Mac_2018.jpg",
  "Earth Wind and Fire": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Earth%2C_Wind_%26_Fire_2019.jpg",
  "Eric Clapton": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Eric_Clapton_2018.jpg",
  "Foreigner": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Foreigner_2018.jpg",
  "Jelly Roll": "https://upload.wikimedia.org/wikipedia/commons/c/c0/Jelly_Roll_2023.jpg",
  "Dierks Bentley": "https://upload.wikimedia.org/wikipedia/commons/7/79/Dierks_Bentley_2019.jpg",
  "Faith Hill": "https://upload.wikimedia.org/wikipedia/commons/0/06/Faith_Hill_2017.jpg",
  "Florida Georgia Line": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Florida_Georgia_Line_2019.jpg",
  
  // ========== MORE BROADWAY ==========
  "Cats": "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cats_musical_logo.jpg",
  "Come From Away": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Come_From_Away_logo.jpg",
  "Company": "https://upload.wikimedia.org/wikipedia/commons/8/87/Company_musical_logo.jpg",
  "Evita": "https://upload.wikimedia.org/wikipedia/commons/4/42/Evita_musical_logo.jpg",
  "Funny Girl": "https://upload.wikimedia.org/wikipedia/commons/f/f8/Funny_Girl_2022.jpg",
  "Into the Woods": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Into_the_Woods_poster.jpg",
  "Jagged Little Pill": "https://upload.wikimedia.org/wikipedia/commons/j/ja/Jagged_Little_Pill_Musical.jpg",
  "Harry Potter Cursed Child": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Harry_Potter_and_the_Cursed_Child_logo.jpg",
  "A Beautiful Noise": "https://upload.wikimedia.org/wikipedia/commons/a/a8/A_Beautiful_Noise_Musical.jpg",
  "ABBA Voyage": "https://upload.wikimedia.org/wikipedia/commons/5/59/ABBA_Voyage_2022.jpg",
  "Ain't Too Proud": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Ain%27t_Too_Proud_Broadway.jpg",
  "Beautiful Carole King": "https://upload.wikimedia.org/wikipedia/commons/b/b3/Beautiful_Carole_King_Musical.jpg",
  
  // ========== REMAINING ARTISTS ==========
  "Luke Bryan": "https://upload.wikimedia.org/wikipedia/commons/6/68/Luke_Bryan_2017.jpg",
  "Reba McEntire": "https://upload.wikimedia.org/wikipedia/commons/8/80/Reba_McEntire_2019.jpg",
  "Madonna": "https://upload.wikimedia.org/wikipedia/commons/4/4c/Madonna_Rebel_Heart_Tour_2015.jpg",
  "Mariah Carey": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Mariah_Carey_2019.jpg",
  "Lionel Richie": "https://upload.wikimedia.org/wikipedia/commons/5/52/Lionel_Richie_2018.jpg",
  "Stevie Nicks": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Stevie_Nicks_2017.jpg",
  "Paul McCartney": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Paul_McCartney_2018.jpg",
  "Ringo Starr": "https://upload.wikimedia.org/wikipedia/commons/2/21/Ringo_Starr_2019.jpg",
  "Neil Young": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Neil_Young_2016.jpg",
  "Rod Stewart": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Rod_Stewart_2018.jpg",
  "Smokey Robinson": "https://upload.wikimedia.org/wikipedia/commons/8/80/Smokey_Robinson_2017.jpg",
  "Motley Crue": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Motley_Crue_2019.jpg",
  "Styx": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Styx_2018.jpg",
  "REO Speedwagon": "https://upload.wikimedia.org/wikipedia/commons/7/7e/REO_Speedwagon_2019.jpg",
  "Kool and the Gang": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Kool_%26_The_Gang_2019.jpg",
  
  // ========== MORE BROADWAY ==========
  "Jesus Christ Superstar": "https://upload.wikimedia.org/wikipedia/commons/j/jc/Jesus_Christ_Superstar_Musical.jpg",
  "Joseph Dreamcoat": "https://upload.wikimedia.org/wikipedia/commons/j/jo/Joseph_Dreamcoat_Musical.jpg",
  "Little Shop of Horrors": "https://upload.wikimedia.org/wikipedia/commons/4/45/Little_Shop_of_Horrors_logo.jpg",
  "Lord of the Dance": "https://upload.wikimedia.org/wikipedia/commons/l/lo/Lord_of_the_Dance_2018.jpg",
  "Mamma Mia": "https://upload.wikimedia.org/wikipedia/commons/m/ma/Mamma_Mia_Musical_Logo.jpg",
  "Mean Girls": "https://upload.wikimedia.org/wikipedia/commons/m/me/Mean_Girls_Musical.jpg",
  "Miss Saigon": "https://upload.wikimedia.org/wikipedia/commons/m/mi/Miss_Saigon_Musical.jpg",
  "Rent": "https://upload.wikimedia.org/wikipedia/commons/r/re/Rent_Musical_Logo.jpg",
  "Riverdance": "https://upload.wikimedia.org/wikipedia/commons/r/ri/Riverdance_2019.jpg",
  "Six": "https://upload.wikimedia.org/wikipedia/commons/s/si/Six_Musical.jpg",
  "Stomp": "https://upload.wikimedia.org/wikipedia/commons/s/st/Stomp_Musical.jpg",
  "Sunday in the Park": "https://upload.wikimedia.org/wikipedia/commons/s/su/Sunday_Park_George.jpg",
  "The Nutcracker": "https://upload.wikimedia.org/wikipedia/commons/n/nu/Nutcracker_Ballet.jpg",
  "Tootsie": "https://upload.wikimedia.org/wikipedia/commons/t/to/Tootsie_Musical.jpg",
  "West Side Story": "https://upload.wikimedia.org/wikipedia/commons/w/we/West_Side_Story_Musical.jpg",
  "Ice Capades": "https://upload.wikimedia.org/wikipedia/commons/i/ic/Ice_Capades_Logo.jpg",
  "Marvel Universe Live": "https://upload.wikimedia.org/wikipedia/commons/m/ma/Marvel_Universe_Live.jpg",
  
  // ========== SPORTS TEAM FIXES ==========
  "LA Chargers": "https://upload.wikimedia.org/wikipedia/commons/1/18/SoFi_Stadium_2023.jpg",
  "LA Rams": "https://upload.wikimedia.org/wikipedia/commons/1/18/SoFi_Stadium_2023.jpg",
  "NY Knicks": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Madison_Square_Garden_2023.jpg",
  "SF Giants": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Oracle_Park_2023.jpg",
  "St Louis Blues": "https://upload.wikimedia.org/wikipedia/commons/9/98/Enterprise_Center_2023.jpg",
  "St Louis Cardinals": "https://upload.wikimedia.org/wikipedia/commons/8/8b/Busch_Stadium_2023.jpg",
  "Sam Barber": "https://upload.wikimedia.org/wikipedia/commons/s/sa/Sam_Barber_2023.jpg",
  "Stephen Wilson Jr.": "https://upload.wikimedia.org/wikipedia/commons/s/sw/Stephen_Wilson_Jr_2023.jpg",
  
  // ========== FINAL BATCH - TRIBUTES & LEGENDS ==========
  "Aretha Franklin Tribute": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Aretha_Franklin_1968.jpg",
  "James Brown Tribute": "https://upload.wikimedia.org/wikipedia/commons/4/46/James_Brown_1973.jpg",
  "Michael Jackson Tribute": "https://upload.wikimedia.org/wikipedia/commons/8/80/Michael_Jackson_1984.jpg",
  "Prince Tribute": "https://upload.wikimedia.org/wikipedia/commons/7/79/Prince_at_Coachella.jpg",
  "Tina Turner": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Tina_Turner_2008.jpg",
  "Tina Turner Musical": "https://upload.wikimedia.org/wikipedia/commons/t/ti/Tina_Turner_Musical.jpg",
  "Whitney Houston Hologram": "https://upload.wikimedia.org/wikipedia/commons/2/21/Whitney_Houston_2010.jpg",
  "Marie Osmond": "https://upload.wikimedia.org/wikipedia/commons/m/ma/Marie_Osmond_2019.jpg",
  "The Who": "https://upload.wikimedia.org/wikipedia/commons/4/4c/The_Who_2019.jpg",
  "The Temptations": "https://upload.wikimedia.org/wikipedia/commons/t/te/The_Temptations_2019.jpg",
  "The Four Tops": "https://upload.wikimedia.org/wikipedia/commons/f/fo/Four_Tops_2019.jpg",
  "The Notebook": "https://upload.wikimedia.org/wikipedia/commons/t/th/The_Notebook_Musical.jpg",
  "Heated Rivalry Party": "https://upload.wikimedia.org/wikipedia/commons/h/he/Sports_Arena_Event.jpg",
  
  // ========== COUNTRY ==========
  "Chris Stapleton": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Chris_Stapleton_2023.jpg",
  "Zach Bryan": "https://upload.wikimedia.org/wikipedia/commons/0/07/Zach_Bryan_performing_at_Crypto.com_Arena_on_23_Aug_2023_%28cropped%29.jpg",
  "Morgan Wallen": "https://upload.wikimedia.org/wikipedia/commons/1/11/Morgan_Wallen_2022.jpg",
  "Luke Combs": "https://upload.wikimedia.org/wikipedia/commons/6/66/Luke_Combs_2021.png",
  "Eric Church": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Eric_Church_2023_%28cropped%29.jpg",
  "Carrie Underwood": "https://upload.wikimedia.org/wikipedia/commons/8/89/Carrie_Underwood_performs_at_the_Grand_Ole_Opry.jpg",
  "Garth Brooks": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Garth_Brooks_White_House.jpg",
  "Shania Twain": "https://upload.wikimedia.org/wikipedia/commons/2/2a/Shania_Twain_Residency.jpg",
  "Cody Johnson": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Cody_Johnson_2022.jpg",
  "Megan Moroney": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Megan_Moroney_2023.jpg",
  "Parker McCollum": "https://upload.wikimedia.org/wikipedia/commons/4/44/Parker_McCollum_picture_1.jpg",
  "Alan Jackson": "https://upload.wikimedia.org/wikipedia/commons/5/57/Alan_Jackson_Sept_2010.jpg",
  "Brad Paisley": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Brad_Paisley_2013.jpg",
  "George Strait": "https://upload.wikimedia.org/wikipedia/commons/f/f6/George_Strait_in_2010.jpg",
  "Rascal Flatts": "https://upload.wikimedia.org/wikipedia/commons/2/22/Rascal_Flatts_2013.jpg",
  "Brooks and Dunn": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Brooks_%26_Dunn_in_July_2010.jpg",
  "Tim McGraw": "https://upload.wikimedia.org/wikipedia/commons/5/54/Tim_McGraw_2016.jpg",
  "Keith Urban": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Keith_Urban_at_the_2023_Academy_of_Country_Music_Awards_%282%29.jpg",
  "Jason Aldean": "https://upload.wikimedia.org/wikipedia/commons/f/fc/Jason_Aldean_in_2011.jpg",
  "Thomas Rhett": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Thomas_Rhett_%28cropped%29.jpg",
  "Kane Brown": "https://upload.wikimedia.org/wikipedia/commons/5/5b/Kane_Brown_2022.jpg",
  "HARDY": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Hardy_chilling_on_tour_bus_before_concert_in_South_Carolina.jpg",
  "Scotty McCreery": "https://upload.wikimedia.org/wikipedia/commons/0/01/ScottyMcCreery2020_%28cropped%29.jpg",
  "Alison Krauss": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Alison_Krauss_MerleFest_2007_01.jpg",
  "Treaty Oak Revival": "https://upload.wikimedia.org/wikipedia/commons/0/03/Treaty_Oak_Revival_performing_at_the_Hordern_Pavilion_Sydney_2025.jpg",
  
  // ========== POP ==========
  "Harry Styles": "https://upload.wikimedia.org/wikipedia/commons/3/32/Harry_Styles_Spotify_Wrapped.png",
  "Ariana Grande": "https://upload.wikimedia.org/wikipedia/commons/d/dd/Ariana_Grande.jpg",
  "Billie Eilish": "https://upload.wikimedia.org/wikipedia/commons/0/04/Billie_Eilish_portrait.jpg",
  "Olivia Rodrigo": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Olivia_Rodrigo_at_the_Guts_Tour_2024.jpg",
  "Dua Lipa": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Dua_Lipa_2020.png",
  "Justin Bieber": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Justin_Bieber_in_2021.jpg",
  "Katy Perry": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Katy_Perry_2022.jpg",
  "Lady Gaga": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Lady_Gaga_at_Joe_Biden%27s_inauguration_%28cropped_5%29.jpg",
  "Shawn Mendes": "https://upload.wikimedia.org/wikipedia/commons/0/00/Shawn_Mendes_VMA_2015.jpg",
  "Ed Sheeran": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Ed_Sheeran_2021.jpg",
  "Bruno Mars": "https://upload.wikimedia.org/wikipedia/commons/8/85/Bruno_Mars_24K_Magic_World_Tour.png",
  "The Weeknd": "https://upload.wikimedia.org/wikipedia/commons/4/49/The_Weeknd_2015.jpg",
  "BTS": "https://upload.wikimedia.org/wikipedia/commons/0/0a/BTS_on_the_Billboard_Music_Awards_red_carpet%2C_1_May_2019.jpg",
  "Twice": "https://upload.wikimedia.org/wikipedia/commons/2/22/Twice_-_Dickies_Arena%2C_2022_%28cropped%29.jpg",
  "Madison Beer": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Madison_Beer_2023.jpg",
  "New Edition": "https://upload.wikimedia.org/wikipedia/commons/6/6e/New_Edition_2014.jpg",
  "Brandi Carlile": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Brandi_Carlile_2018.jpg",
  "Adele": "https://upload.wikimedia.org/wikipedia/commons/5/52/Adele_-_Live_2016%2C_Saint_Paul_MN.jpg",
  "Elton John": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Elton_John_2011.jpg",
  "Celine Dion": "https://upload.wikimedia.org/wikipedia/commons/2/2b/Celine_Dion_Berlin_2017.jpg",
  "Jennifer Lopez": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Jennifer_Lopez_2018.jpg",
  
  // ========== ROCK ==========
  "Coldplay": "https://upload.wikimedia.org/wikipedia/commons/3/36/Coldplay-3.jpg",
  "Foo Fighters": "https://upload.wikimedia.org/wikipedia/commons/6/60/Foo_Fighters_-_Rock_am_Ring_2018.jpg",
  "Green Day": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Green_Day_2024.jpg",
  "Red Hot Chili Peppers": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Red_Hot_Chili_Peppers_2023.jpg",
  "Linkin Park": "https://upload.wikimedia.org/wikipedia/commons/9/99/Linkin_Park_logo.jpg",
  "My Chemical Romance": "https://upload.wikimedia.org/wikipedia/commons/5/5f/My_Chemical_Romance_-_Rock_im_Park_2022_%28cropped%29.jpg",
  "Imagine Dragons": "https://upload.wikimedia.org/wikipedia/commons/9/92/Imagine_Dragons%2C_2022.jpg",
  "The Killers": "https://upload.wikimedia.org/wikipedia/commons/3/39/The_Killers_2022.jpg",
  "System of a Down": "https://upload.wikimedia.org/wikipedia/commons/6/6c/System_of_a_Down_-_Nova_Rock_2024.jpg",
  "Slipknot": "https://upload.wikimedia.org/wikipedia/commons/a/af/Slipknot_%28band%29.jpg",
  "Blink-182": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Blink-182_2023.jpg",
  "Journey": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Journey_performing_at_the_2016_Wisconsin_State_Fair.jpg",
  "The Eagles": "https://upload.wikimedia.org/wikipedia/commons/8/8c/The_Eagles_2018.jpg",
  "Billy Joel": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Billy_Joel_-_Perth_2008.jpg",
  "Bruce Springsteen": "https://upload.wikimedia.org/wikipedia/commons/9/96/Bruce_Springsteen_-_Roskilde_2012.jpg",
  "Bob Dylan": "https://upload.wikimedia.org/wikipedia/commons/0/02/Bob_Dylan_-_Azkena_Rock_Festival_2010_1.jpg",
  "John Mellencamp": "https://upload.wikimedia.org/wikipedia/commons/0/07/John_Mellenkamp_2007_%28cropped%29.jpg",
  "Three Dog Night": "https://upload.wikimedia.org/wikipedia/commons/3/38/Three_Dog_Night_1972.JPG",
  "Tori Amos": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Tori_Amos_12_01_2017_-7_%2839335517972%29.jpg",
  "Boston": "https://upload.wikimedia.org/wikipedia/commons/a/ae/Boston_band_2008.jpg",
  "Dropkick Murphys": "https://upload.wikimedia.org/wikipedia/commons/b/b1/Dropkick_Murphys_2014.jpg",
  "Five Finger Death Punch": "https://upload.wikimedia.org/wikipedia/commons/7/7e/Five_Finger_Death_Punch_%28band%29.jpg",
  "Rob Zombie": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Rob_Zombie_-_Wacken_Open_Air_2015.jpg",
  "Lorna Shore": "https://upload.wikimedia.org/wikipedia/commons/1/19/Lorna_Shore_Hellfest_2023.jpg",
  "Disturbed": "https://upload.wikimedia.org/wikipedia/commons/8/89/Disturbed_%28band%29.jpg",
  "Godsmack": "https://upload.wikimedia.org/wikipedia/commons/a/a6/Godsmack_2018.jpg",
  
  // ========== HIP HOP / RAP ==========
  "A$AP Rocky": "https://upload.wikimedia.org/wikipedia/commons/b/ba/A%24AP_Rocky_at_the_2025_Cannes_Film_Festival_%28cropped_3x4%29.jpg",
  "A Boogie Wit Da Hoodie": "https://upload.wikimedia.org/wikipedia/commons/1/1e/A_Boogie_wit_da_Hoodie_2024.png",
  "Bad Bunny": "https://upload.wikimedia.org/wikipedia/commons/3/31/Bad_Bunny_2019_by_Glenn_Francis_%28cropped%29.jpg",
  "Cardi B": "https://upload.wikimedia.org/wikipedia/commons/3/36/Cardi_B_March_2024.png",
  "Peso Pluma": "https://upload.wikimedia.org/wikipedia/commons/4/47/Peso_Pluma_2023.jpg",
  "bbno$": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Bbno%24_Twitchcon_2024.jpg",
  "Usher": "https://upload.wikimedia.org/wikipedia/commons/b/bf/Usher_2024.jpg",
  
  // ========== EDM / ELECTRONIC ==========
  "Fred Again": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Fred_Again_2025_%28cropped%29.jpg",
  "Illenium": "https://upload.wikimedia.org/wikipedia/commons/a/a5/Illenium_2019.jpg",
  "INZO": "https://upload.wikimedia.org/wikipedia/commons/e/ec/INZO_2022.jpg",
  "Pitbull": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Pitbull_2017.jpg",
  
  // ========== COMEDY ==========
  "Nate Bargatze": "https://upload.wikimedia.org/wikipedia/commons/e/e9/Nate_Bargatze_2023.jpg",
  "Shane Gillis": "https://upload.wikimedia.org/wikipedia/commons/3/30/Shane_Gillis_%28cropped%29.jpg",
  "Jo Koy": "https://upload.wikimedia.org/wikipedia/commons/7/76/Jo_Koy_2019.jpg",
  "Katt Williams": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Katt_Williams_2024.jpg",
  "Matt Rife": "https://upload.wikimedia.org/wikipedia/commons/8/84/Matt_Rife_2023.jpg",
  "Weird Al Yankovic": "https://upload.wikimedia.org/wikipedia/commons/b/be/%22Weird_Al%22_Yankovic_2018.jpg",
  "Ali Siddiq": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Ali_Siddiq_2023.jpg",
  
  // ========== BROADWAY / THEATER ==========
  "Hamilton": "https://upload.wikimedia.org/wikipedia/commons/8/88/Hamilton_playbill.jpg",
  "The Lion King": "https://upload.wikimedia.org/wikipedia/commons/4/4f/The_Lion_King_musical.jpg",
  "Wicked": "https://upload.wikimedia.org/wikipedia/commons/d/d3/Wicked_Poster.jpg",
  "Phantom of the Opera": "https://upload.wikimedia.org/wikipedia/commons/3/31/Phantom_of_the_Opera_Poster.jpg",
  "Chicago": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Chicago_the_Musical_Banners_on_Broadway_%286284881463%29.jpg",
  "Aladdin": "https://upload.wikimedia.org/wikipedia/commons/7/77/Aladdin_-_11884162153.jpg",
  "Les Miserables": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Les_Miserables_logo.jpg",
  "Les Misérables": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Les_Miserables_logo.jpg",
  "Frozen": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Frozen_-_Broadway.jpg",
  "Book of Mormon": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Book_of_Mormon_Musical.jpg",
  "Dear Evan Hansen": "https://upload.wikimedia.org/wikipedia/commons/9/94/Dear_Evan_Hansen_2017.jpg",
  "The Color Purple": "https://upload.wikimedia.org/wikipedia/commons/4/40/Color_Purple_Broadway.jpg",
  "Beetlejuice": "https://upload.wikimedia.org/wikipedia/commons/9/98/Beetlejuice_Musical_2019.jpg",
  "Harry Potter and the Cursed Child": "https://upload.wikimedia.org/wikipedia/commons/a/a4/Harry_Potter_and_the_Cursed_Child_logo.jpg",
  "MJ the Musical": "https://upload.wikimedia.org/wikipedia/commons/e/e2/MJ_the_Musical_logo.jpg",
  "Hadestown": "https://upload.wikimedia.org/wikipedia/commons/8/8b/Hadestown_Musical.jpg",
  "Moulin Rouge": "https://upload.wikimedia.org/wikipedia/commons/e/e2/Moulin_Rouge%21_The_Musical_logo.jpg",
  "Jersey Boys": "https://upload.wikimedia.org/wikipedia/commons/2/26/Jersey_Boys_logo.jpg",
  "Waitress": "https://upload.wikimedia.org/wikipedia/commons/d/d5/Waitress_Musical_Logo.jpg",
  "Sweeney Todd": "https://upload.wikimedia.org/wikipedia/commons/0/0e/Sweeney_Todd_Marquee.jpg",
  "Back to the Future": "https://upload.wikimedia.org/wikipedia/commons/e/ed/Back_to_the_Future_Musical_London.jpg",
  "Blue Man Group": "https://upload.wikimedia.org/wikipedia/commons/2/29/Blue_Man_Group_2013.jpg",
  "Cirque du Soleil": "https://upload.wikimedia.org/wikipedia/commons/8/85/Cirque_du_Soleil.jpg",
  "Disney On Ice": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Disney_on_Ice_logo.jpg",
  
  // ========== MISC CONCERT PERFORMERS ==========
  "Ricardo Arjona": "https://upload.wikimedia.org/wikipedia/commons/2/2d/Concierto_Ricardo_Arjona_Miami_2009_%28cropped%29.jpg",
  "Alex Warren": "https://upload.wikimedia.org/wikipedia/commons/5/54/Image_Alex_W_%28cropped%29.jpg",
  "Ty Myers": "https://music-row-website-assets.s3.amazonaws.com/wp-content/uploads/2024/01/06173521/Ty-Myers-Photo-credit-Alysse-Gafkjen-scaled.jpeg",
  "Audrey Hobert": "https://upload.wikimedia.org/wikipedia/commons/8/89/AudreyHobertJuly25.jpg",
  "Jack Johnson": "https://upload.wikimedia.org/wikipedia/commons/5/57/Jack_Johnson_%28musician%29.jpg",
  "Barry Manilow": "https://upload.wikimedia.org/wikipedia/commons/5/53/Barry_Manilow_2021.jpg",
  "Donny Osmond": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Donny_Osmond_2019.jpg",
  "Brandon Lake": "https://upload.wikimedia.org/wikipedia/commons/5/59/Brandon_Lake_2023.jpg",
  "TobyMac": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Tobymac_2013.jpg",
  "Forrest Frank": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Forrest_Frank_2023.jpg",
  "Mariah the Scientist": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Mariah_the_Scientist_2023.jpg",
  "Monaleo": "https://upload.wikimedia.org/wikipedia/commons/2/23/Monaleo_2023.jpg",
  
  // ========== NFL TEAMS (Football stadium images) ==========
  "Arizona Cardinals": "https://upload.wikimedia.org/wikipedia/commons/7/7d/State_Farm_Stadium_2024.jpg",
  "Atlanta Falcons": "https://upload.wikimedia.org/wikipedia/commons/d/d1/Mercedes-Benz_Stadium_2024.jpg",
  "Baltimore Ravens": "https://upload.wikimedia.org/wikipedia/commons/c/c1/M%26T_Bank_Stadium_2019.jpg",
  "Buffalo Bills": "https://upload.wikimedia.org/wikipedia/commons/5/54/Highmark_Stadium_2023.jpg",
  "Carolina Panthers": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Bank_of_America_Stadium_2023.jpg",
  "Chicago Bears": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Soldier_Field_Chicago_October_2022.jpg",
  "Cincinnati Bengals": "https://upload.wikimedia.org/wikipedia/commons/7/77/Paycor_Stadium_2023.jpg",
  "Cleveland Browns": "https://upload.wikimedia.org/wikipedia/commons/c/c4/Cleveland_Browns_Stadium_2023.jpg",
  "Dallas Cowboys": "https://upload.wikimedia.org/wikipedia/commons/1/1f/AT%26T_Stadium_2023.jpg",
  "Denver Broncos": "https://upload.wikimedia.org/wikipedia/commons/4/49/Empower_Field_at_Mile_High_2023.jpg",
  "Detroit Lions": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Ford_Field_Interior_2023.jpg",
  "Green Bay Packers": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Lambeau_Field_2023.jpg",
  "Houston Texans": "https://upload.wikimedia.org/wikipedia/commons/b/b0/NRG_Stadium_2023.jpg",
  "Indianapolis Colts": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Lucas_Oil_Stadium_2023.jpg",
  "Jacksonville Jaguars": "https://upload.wikimedia.org/wikipedia/commons/f/f1/EverBank_Stadium_2023.jpg",
  "Kansas City Chiefs": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Arrowhead_Stadium_2023.jpg",
  "Las Vegas Raiders": "https://upload.wikimedia.org/wikipedia/commons/a/ab/Allegiant_Stadium_2021.jpg",
  "Los Angeles Chargers": "https://upload.wikimedia.org/wikipedia/commons/1/18/SoFi_Stadium_2023.jpg",
  "Los Angeles Rams": "https://upload.wikimedia.org/wikipedia/commons/1/18/SoFi_Stadium_2023.jpg",
  "Miami Dolphins": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Hard_Rock_Stadium_2023.jpg",
  "Minnesota Vikings": "https://upload.wikimedia.org/wikipedia/commons/3/3e/U.S._Bank_Stadium_2023.jpg",
  "New England Patriots": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Gillette_Stadium_2023.jpg",
  "New Orleans Saints": "https://upload.wikimedia.org/wikipedia/commons/0/09/Caesars_Superdome_2023.jpg",
  "New York Giants": "https://upload.wikimedia.org/wikipedia/commons/6/6c/MetLife_Stadium_2023.jpg",
  "NY Giants": "https://upload.wikimedia.org/wikipedia/commons/6/6c/MetLife_Stadium_2023.jpg",
  "New York Jets": "https://upload.wikimedia.org/wikipedia/commons/6/6c/MetLife_Stadium_2023.jpg",
  "NY Jets": "https://upload.wikimedia.org/wikipedia/commons/6/6c/MetLife_Stadium_2023.jpg",
  "Philadelphia Eagles": "https://upload.wikimedia.org/wikipedia/commons/2/23/Lincoln_Financial_Field_2023.jpg",
  "Pittsburgh Steelers": "https://upload.wikimedia.org/wikipedia/commons/9/9e/Acrisure_Stadium_2023.jpg",
  "San Francisco 49ers": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Levi%27s_Stadium_2023.jpg",
  "SF 49ers": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Levi%27s_Stadium_2023.jpg",
  "Seattle Seahawks": "https://upload.wikimedia.org/wikipedia/commons/1/17/Lumen_Field_2023.jpg",
  "Tampa Bay Buccaneers": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Raymond_James_Stadium_2023.jpg",
  "Tennessee Titans": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Nissan_Stadium_2023.jpg",
  "Washington Commanders": "https://upload.wikimedia.org/wikipedia/commons/8/81/Commanders_Field_2023.jpg",
  
  // ========== NBA TEAMS (Basketball court images) ==========
  "Atlanta Hawks": "https://upload.wikimedia.org/wikipedia/commons/6/68/State_Farm_Arena_2023.jpg",
  "Boston Celtics": "https://upload.wikimedia.org/wikipedia/commons/c/c4/TD_Garden_2023.jpg",
  "Brooklyn Nets": "https://upload.wikimedia.org/wikipedia/commons/a/a7/Barclays_Center_2023.jpg",
  "Charlotte Hornets": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Spectrum_Center_2023.jpg",
  "Chicago Bulls": "https://upload.wikimedia.org/wikipedia/commons/5/5b/United_Center_2023.jpg",
  "Cleveland Cavaliers": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Rocket_Mortgage_FieldHouse_2023.jpg",
  "Dallas Mavericks": "https://upload.wikimedia.org/wikipedia/commons/5/5e/American_Airlines_Center_2023.jpg",
  "Denver Nuggets": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ball_Arena_2023.jpg",
  "Detroit Pistons": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Little_Caesars_Arena_2023.jpg",
  "Golden State Warriors": "https://upload.wikimedia.org/wikipedia/commons/6/63/Chase_Center_2023.jpg",
  "Houston Rockets": "https://upload.wikimedia.org/wikipedia/commons/1/13/Toyota_Center_2023.jpg",
  "Indiana Pacers": "https://upload.wikimedia.org/wikipedia/commons/8/84/Gainbridge_Fieldhouse_2023.jpg",
  "LA Lakers": "https://upload.wikimedia.org/wikipedia/commons/7/75/Crypto.com_Arena_2023.jpg",
  "Los Angeles Lakers": "https://upload.wikimedia.org/wikipedia/commons/7/75/Crypto.com_Arena_2023.jpg",
  "LA Clippers": "https://upload.wikimedia.org/wikipedia/commons/9/94/Intuit_Dome_2024.jpg",
  "Los Angeles Clippers": "https://upload.wikimedia.org/wikipedia/commons/9/94/Intuit_Dome_2024.jpg",
  "Memphis Grizzlies": "https://upload.wikimedia.org/wikipedia/commons/5/5d/FedExForum_2023.jpg",
  "Miami Heat": "https://upload.wikimedia.org/wikipedia/commons/8/88/Kaseya_Center_2023.jpg",
  "Milwaukee Bucks": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Fiserv_Forum_2023.jpg",
  "Minnesota Timberwolves": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Target_Center_2023.jpg",
  "New Orleans Pelicans": "https://upload.wikimedia.org/wikipedia/commons/2/26/Smoothie_King_Center_2023.jpg",
  "New York Knicks": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Madison_Square_Garden_2023.jpg",
  "Oklahoma City Thunder": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Paycom_Center_2023.jpg",
  "Orlando Magic": "https://upload.wikimedia.org/wikipedia/commons/4/41/Kia_Center_2023.jpg",
  "Philadelphia 76ers": "https://upload.wikimedia.org/wikipedia/commons/0/05/Wells_Fargo_Center_2023.jpg",
  "Phoenix Suns": "https://upload.wikimedia.org/wikipedia/commons/9/96/Footprint_Center_2023.jpg",
  "Portland Trail Blazers": "https://upload.wikimedia.org/wikipedia/commons/9/97/Moda_Center_2023.jpg",
  "Sacramento Kings": "https://upload.wikimedia.org/wikipedia/commons/6/61/Golden_1_Center_2023.jpg",
  "San Antonio Spurs": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Frost_Bank_Center_2023.jpg",
  "Toronto Raptors": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Scotiabank_Arena_2023.jpg",
  "Utah Jazz": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Delta_Center_2023.jpg",
  "Washington Wizards": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Capital_One_Arena_2023.jpg",
  
  // ========== NHL TEAMS (Hockey arena images) ==========
  "Anaheim Ducks": "https://upload.wikimedia.org/wikipedia/commons/7/76/Honda_Center_2023.jpg",
  "Arizona Coyotes": "https://upload.wikimedia.org/wikipedia/commons/9/96/Mullett_Arena_2023.jpg",
  "Boston Bruins": "https://upload.wikimedia.org/wikipedia/commons/c/c4/TD_Garden_2023.jpg",
  "Buffalo Sabres": "https://upload.wikimedia.org/wikipedia/commons/5/5a/KeyBank_Center_2023.jpg",
  "Calgary Flames": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Scotiabank_Saddledome_2023.jpg",
  "Carolina Hurricanes": "https://upload.wikimedia.org/wikipedia/commons/1/13/PNC_Arena_2023.jpg",
  "Chicago Blackhawks": "https://upload.wikimedia.org/wikipedia/commons/5/5b/United_Center_2023.jpg",
  "Colorado Avalanche": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ball_Arena_2023.jpg",
  "Columbus Blue Jackets": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Nationwide_Arena_2023.jpg",
  "Dallas Stars": "https://upload.wikimedia.org/wikipedia/commons/5/5e/American_Airlines_Center_2023.jpg",
  "Detroit Red Wings": "https://upload.wikimedia.org/wikipedia/commons/7/7f/Little_Caesars_Arena_2023.jpg",
  "Edmonton Oilers": "https://upload.wikimedia.org/wikipedia/commons/2/26/Rogers_Place_2023.jpg",
  "Florida Panthers": "https://upload.wikimedia.org/wikipedia/commons/4/44/Amerant_Bank_Arena_2023.jpg",
  "Los Angeles Kings": "https://upload.wikimedia.org/wikipedia/commons/7/75/Crypto.com_Arena_2023.jpg",
  "Minnesota Wild": "https://upload.wikimedia.org/wikipedia/commons/3/33/Xcel_Energy_Center_2023.jpg",
  "Montreal Canadiens": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Bell_Centre_2023.jpg",
  "Nashville Predators": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Bridgestone_Arena_2023.jpg",
  "New Jersey Devils": "https://upload.wikimedia.org/wikipedia/commons/9/96/Prudential_Center_2023.jpg",
  "NY Rangers": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Madison_Square_Garden_2023.jpg",
  "New York Rangers": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Madison_Square_Garden_2023.jpg",
  "NY Islanders": "https://upload.wikimedia.org/wikipedia/commons/c/ce/UBS_Arena_2023.jpg",
  "New York Islanders": "https://upload.wikimedia.org/wikipedia/commons/c/ce/UBS_Arena_2023.jpg",
  "Ottawa Senators": "https://upload.wikimedia.org/wikipedia/commons/5/5d/Canadian_Tire_Centre_2023.jpg",
  "Philadelphia Flyers": "https://upload.wikimedia.org/wikipedia/commons/0/05/Wells_Fargo_Center_2023.jpg",
  "Pittsburgh Penguins": "https://upload.wikimedia.org/wikipedia/commons/1/1c/PPG_Paints_Arena_2023.jpg",
  "San Jose Sharks": "https://upload.wikimedia.org/wikipedia/commons/e/ef/SAP_Center_2023.jpg",
  "Seattle Kraken": "https://upload.wikimedia.org/wikipedia/commons/7/76/Climate_Pledge_Arena_2023.jpg",
  "St. Louis Blues": "https://upload.wikimedia.org/wikipedia/commons/9/98/Enterprise_Center_2023.jpg",
  "Tampa Bay Lightning": "https://upload.wikimedia.org/wikipedia/commons/e/e5/Amalie_Arena_2023.jpg",
  "Toronto Maple Leafs": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Scotiabank_Arena_2023.jpg",
  "Vancouver Canucks": "https://upload.wikimedia.org/wikipedia/commons/9/96/Rogers_Arena_2023.jpg",
  "Vegas Golden Knights": "https://upload.wikimedia.org/wikipedia/commons/8/85/T-Mobile_Arena_2023.jpg",
  "Washington Capitals": "https://upload.wikimedia.org/wikipedia/commons/5/5a/Capital_One_Arena_2023.jpg",
  "Winnipeg Jets": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Canada_Life_Centre_2023.jpg",
  
  // ========== MLB TEAMS (Baseball stadium images) ==========
  "Arizona Diamondbacks": "https://upload.wikimedia.org/wikipedia/commons/0/0b/Chase_Field_2023.jpg",
  "Atlanta Braves": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Truist_Park_2023.jpg",
  "Baltimore Orioles": "https://upload.wikimedia.org/wikipedia/commons/0/03/Oriole_Park_at_Camden_Yards_2023.jpg",
  "Boston Red Sox": "https://upload.wikimedia.org/wikipedia/commons/1/1d/Fenway_Park_2023.jpg",
  "Chicago Cubs": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Wrigley_Field_2023.jpg",
  "Chicago White Sox": "https://upload.wikimedia.org/wikipedia/commons/3/39/Guaranteed_Rate_Field_2023.jpg",
  "Cincinnati Reds": "https://upload.wikimedia.org/wikipedia/commons/a/a1/Great_American_Ball_Park_2023.jpg",
  "Cleveland Guardians": "https://upload.wikimedia.org/wikipedia/commons/5/52/Progressive_Field_2023.jpg",
  "Colorado Rockies": "https://upload.wikimedia.org/wikipedia/commons/b/b4/Coors_Field_2023.jpg",
  "Detroit Tigers": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Comerica_Park_2023.jpg",
  "Houston Astros": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Minute_Maid_Park_2023.jpg",
  "Kansas City Royals": "https://upload.wikimedia.org/wikipedia/commons/a/a0/Kauffman_Stadium_2023.jpg",
  "LA Angels": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Angel_Stadium_2023.jpg",
  "Los Angeles Angels": "https://upload.wikimedia.org/wikipedia/commons/4/4b/Angel_Stadium_2023.jpg",
  "LA Dodgers": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Dodger_Stadium_2023.jpg",
  "Los Angeles Dodgers": "https://upload.wikimedia.org/wikipedia/commons/d/d9/Dodger_Stadium_2023.jpg",
  "Miami Marlins": "https://upload.wikimedia.org/wikipedia/commons/8/8f/LoanDepot_Park_2023.jpg",
  "Milwaukee Brewers": "https://upload.wikimedia.org/wikipedia/commons/a/a6/American_Family_Field_2023.jpg",
  "Minnesota Twins": "https://upload.wikimedia.org/wikipedia/commons/1/17/Target_Field_2023.jpg",
  "New York Mets": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Citi_Field_2023.jpg",
  "NY Mets": "https://upload.wikimedia.org/wikipedia/commons/6/6e/Citi_Field_2023.jpg",
  "New York Yankees": "https://upload.wikimedia.org/wikipedia/commons/8/85/Yankee_Stadium_2023.jpg",
  "NY Yankees": "https://upload.wikimedia.org/wikipedia/commons/8/85/Yankee_Stadium_2023.jpg",
  "Oakland Athletics": "https://upload.wikimedia.org/wikipedia/commons/c/c3/Oakland_Coliseum_2023.jpg",
  "Philadelphia Phillies": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Citizens_Bank_Park_2023.jpg",
  "Pittsburgh Pirates": "https://upload.wikimedia.org/wikipedia/commons/8/8a/PNC_Park_2023.jpg",
  "San Diego Padres": "https://upload.wikimedia.org/wikipedia/commons/3/34/Petco_Park_2023.jpg",
  "San Francisco Giants": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Oracle_Park_2023.jpg",
  "Seattle Mariners": "https://upload.wikimedia.org/wikipedia/commons/0/0a/T-Mobile_Park_2023.jpg",
  "St. Louis Cardinals": "https://upload.wikimedia.org/wikipedia/commons/8/8b/Busch_Stadium_2023.jpg",
  "Tampa Bay Rays": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Tropicana_Field_2023.jpg",
  "Texas Rangers": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Globe_Life_Field_2023.jpg",
  "Toronto Blue Jays": "https://upload.wikimedia.org/wikipedia/commons/8/8a/Rogers_Centre_2023.jpg",
  "Washington Nationals": "https://upload.wikimedia.org/wikipedia/commons/d/d8/Nationals_Park_2023.jpg",
  
  // ========== WORLD CUP & SOCCER ==========
  "FIFA World Cup 2026": "https://upload.wikimedia.org/wikipedia/commons/e/e7/2026_FIFA_World_Cup_logo.svg",
  "World Cup 2026": "https://upload.wikimedia.org/wikipedia/commons/e/e7/2026_FIFA_World_Cup_logo.svg",
  "World Cup": "https://upload.wikimedia.org/wikipedia/commons/e/e7/2026_FIFA_World_Cup_logo.svg",
  
  // ========== WWE/UFC ==========
  "WWE Raw": "https://upload.wikimedia.org/wikipedia/commons/f/fd/WWE_Raw_Logo_%282019%29.png",
  "WWE SmackDown": "https://upload.wikimedia.org/wikipedia/commons/6/64/WWE_SmackDown_Logo_%282019%29.png",
  "WWE": "https://upload.wikimedia.org/wikipedia/commons/e/e5/WWE_Logo.png",
  "UFC": "https://upload.wikimedia.org/wikipedia/commons/9/9d/UFC_Logo.png",
  
  // ========== OTHER SPORTS ==========
  "Monster Jam": "https://upload.wikimedia.org/wikipedia/commons/8/86/Monster_Jam_logo.png",
  "PBR": "https://upload.wikimedia.org/wikipedia/commons/c/c5/PBR_logo.png",
  "NFR": "https://upload.wikimedia.org/wikipedia/commons/7/77/NFR_logo.png",
  "Harlem Globetrotters": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Harlem_Globetrotters_Logo.svg",
};

// Category-based default images
const categoryDefaults: Record<string, string> = {
  concerts: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format",
  theater: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format",
  comedy: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&auto=format",
  "fifa-world-cup-2026": "https://upload.wikimedia.org/wikipedia/commons/e/e7/2026_FIFA_World_Cup_logo.svg",
};

// Sport-specific defaults
const sportDefaults: Record<string, string> = {
  nfl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&auto=format",
  nba: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format",
  nhl: "https://images.unsplash.com/photo-1515703407324-5f73f5d64aa1?w=800&auto=format",
  mlb: "https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=800&auto=format",
  mls: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format",
};

function getImageForPerformer(name: string, categorySlug: string | null): string {
  // Direct match
  if (performerImageMap[name]) {
    return performerImageMap[name];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(performerImageMap)) {
    if (name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(name.toLowerCase())) {
      return value;
    }
  }
  
  // NFL team check
  const nflTeams = ['Cardinals', 'Falcons', 'Ravens', 'Bills', 'Panthers', 'Bears', 'Bengals', 'Browns', 'Cowboys', 'Broncos', 'Lions', 'Packers', 'Texans', 'Colts', 'Jaguars', 'Chiefs', 'Raiders', 'Chargers', 'Rams', 'Dolphins', 'Vikings', 'Patriots', 'Saints', 'Giants', 'Jets', 'Eagles', 'Steelers', '49ers', 'Seahawks', 'Buccaneers', 'Titans', 'Commanders'];
  if (nflTeams.some(team => name.includes(team))) {
    return sportDefaults.nfl;
  }
  
  // NBA team check
  const nbaTeams = ['Hawks', 'Celtics', 'Nets', 'Hornets', 'Bulls', 'Cavaliers', 'Mavericks', 'Nuggets', 'Pistons', 'Warriors', 'Rockets', 'Pacers', 'Lakers', 'Clippers', 'Grizzlies', 'Heat', 'Bucks', 'Timberwolves', 'Pelicans', 'Knicks', 'Thunder', 'Magic', '76ers', 'Suns', 'Trail Blazers', 'Kings', 'Spurs', 'Raptors', 'Jazz', 'Wizards'];
  if (nbaTeams.some(team => name.includes(team))) {
    return sportDefaults.nba;
  }
  
  // NHL team check
  const nhlTeams = ['Ducks', 'Coyotes', 'Bruins', 'Sabres', 'Flames', 'Hurricanes', 'Blackhawks', 'Avalanche', 'Blue Jackets', 'Stars', 'Red Wings', 'Oilers', 'Panthers', 'Kings', 'Wild', 'Canadiens', 'Predators', 'Devils', 'Rangers', 'Islanders', 'Senators', 'Flyers', 'Penguins', 'Sharks', 'Kraken', 'Blues', 'Lightning', 'Maple Leafs', 'Canucks', 'Golden Knights', 'Capitals', 'Jets'];
  if (nhlTeams.some(team => name.includes(team))) {
    return sportDefaults.nhl;
  }
  
  // MLB team check
  const mlbTeams = ['Diamondbacks', 'Braves', 'Orioles', 'Red Sox', 'Cubs', 'White Sox', 'Reds', 'Guardians', 'Rockies', 'Tigers', 'Astros', 'Royals', 'Angels', 'Dodgers', 'Marlins', 'Brewers', 'Twins', 'Mets', 'Yankees', 'Athletics', 'Phillies', 'Pirates', 'Padres', 'Giants', 'Mariners', 'Cardinals', 'Rays', 'Rangers', 'Blue Jays', 'Nationals'];
  if (mlbTeams.some(team => name.includes(team))) {
    return sportDefaults.mlb;
  }
  
  // Category default
  if (categorySlug && categoryDefaults[categorySlug]) {
    return categoryDefaults[categorySlug];
  }
  
  return categoryDefaults.concerts;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all performers with their categories
    const { data: performers, error: fetchError } = await supabase
      .from('performers')
      .select(`
        id,
        name,
        image_url,
        category_id,
        categories:category_id (slug)
      `)
      .order('name');

    if (fetchError) {
      throw fetchError;
    }

    const updates: { id: string; name: string; oldImage: string; newImage: string }[] = [];
    const failed: { id: string; name: string; error: string }[] = [];

    for (const performer of performers) {
      const currentImage = performer.image_url || '';
      const categorySlug = (performer.categories as any)?.slug || null;
      
      // Check if image needs updating (broken URL, generic category image, gotickets URL, or generic unsplash)
      const needsUpdate = 
        !currentImage ||
        currentImage.includes('gotickets.com') ||
        currentImage.startsWith('/performers/') ||
        currentImage.includes('placeholder') ||
        currentImage.includes('unsplash.com');
      
      if (needsUpdate) {
        const newImage = getImageForPerformer(performer.name, categorySlug);
        
        if (newImage !== currentImage) {
          const { error: updateError } = await supabase
            .from('performers')
            .update({ image_url: newImage })
            .eq('id', performer.id);
          
          if (updateError) {
            failed.push({ id: performer.id, name: performer.name, error: updateError.message });
          } else {
            updates.push({
              id: performer.id,
              name: performer.name,
              oldImage: currentImage,
              newImage: newImage
            });
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalPerformers: performers.length,
        updated: updates.length,
        failed: failed.length,
        updates: updates.slice(0, 50), // Return first 50 for preview
        failures: failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error updating performer images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
