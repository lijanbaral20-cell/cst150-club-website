-- Used for insering the data into table
USE nightwave_club;

-- Insering data into product table
INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Classic T-Shirt','Classic black Nightwave club T-shirt featuring the official Nightwave logo.',12.00,35.00,'nightwave-classic-tshirt.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image)
VALUES ('Nightwave Premium Hoodie','Premium heavyweight black hoodie featuring embroidered Nightwave club branding.',28.00,69.00,'nightwave-premium-hoodie.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image)
VALUES ('Nightwave Club Cap','Adjustable black baseball cap featuring the Nightwave club logo.',8.00,25.00,'nightwave-club-cap.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Bucket Hat','Black bucket hat featuring Nightwave branding, perfect for concerts and festivals.',10.00,30.00,'nightwave-bucket-hat.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Water Bottle','Reusable stainless steel water bottle featuring the official Nightwave club branding.',7.00,22.00,'nightwave-water-bottle.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Tote Bag','Reusable black tote bag featuring a minimalist Nightwave club logo.',6.00,20.00,'nightwave-tote-bag.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Event Wristband','Official Nightwave fabric wristband designed for club nights and live events.',2.00,8.00,'nightwave-wristband.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Concert Sunglasses','Stylish black sunglasses featuring subtle Nightwave branding for concerts and festivals.',9.00,28.00,'nightwave-sunglasses.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Beanie','Comfortable black beanie featuring an embroidered Nightwave club logo.',7.00,24.00,'nightwave-beanie.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Phone Case','Protective phone case featuring the official Nightwave club branding and artwork.',8.00,25.00,'nightwave-phone-case.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Concert Lanyard','Official Nightwave branded lanyard suitable for event passes, keys and everyday use.',3.00,12.00,'nightwave-lanyard.jpg');

INSERT INTO products (product_title, product_description, cost_price, sell_price, product_image) 
VALUES ('Nightwave Logo Keychain','Compact metal keychain featuring the Nightwave club logo.',3.00,10.00,'nightwave-keychain.jpg');

SELECT * FROM products;
