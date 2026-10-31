export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🚩' }
];

export const translations = {
  en: {
    // Top Bar & Header
    app_title: "Yash Marketing",
    authorized_portal: "Authorized Dealer Portal",
    customer_mode: "CUSTOMER",
    dealer_mode: "DEALER",
    logout: "LOGOUT",
    secure_login: "SECURE LOGIN",
    enter_10_digit: "Enter 10-digit number",
    mobile_no_placeholder: "MOBILE NO.",
    invalid_number: "Invalid Number",
    select_language: "Select Language",
    language: "Language",
    change_language_instruction: "👉 Click Here to Change Language:",
    
    // Bottom Nav
    nav_home: "Home",
    nav_offers: "Offers",
    nav_orders: "Orders",
    nav_ledger: "Ledger",
    nav_help: "Help Ticket",
    nav_cart: "Cart",
    
    // Catalog / Home Screen
    search_placeholder: "Search products, brands...",
    select_category: "Select Category",
    all_brands: "All Brands",
    sort_high_low: "Price: High to Low",
    sort_low_high: "Price: Low to High",
    out_of_stock: "Out of Stock",
    item_out_of_stock: "ITEM CURRENTLY OUT OF STOCK",
    on_order: "ON ORDER",
    on_order_desc: "ON ORDER (Available Next Day)",
    new_badge: "NEW",
    offer_badge: "OFFER",
    add_btn: "+ ADD",
    add_next_day_btn: "+ ADD (Next Day)",
    add_to_order: "🛒 Add To Cart",
    add_to_order_next_day: "🛒 Add To Cart (Next Day)",
    add_to_cart: "🛒 Add To Cart",
    share_photo: "SHARE PHOTO",
    share_with_dealer: "SHARE PHOTO WITH DEALER",
    contact_us: "Contact Us",
    mrp: "MRP",
    off: "OFF",
    view_cart: "VIEW CART  ",
    total_qty: "Total Qty",
    syncing_inventory: "Syncing Inventory...",
    inventory_failed: "Inventory Sync Failed",
    force_refresh: "FORCE REFRESH",
    no_categories: "Categories found empty.",
    no_products_filter: "No products found for this filter.",
    bulk_tracker: "Bulk Discount Tracker",
    active_discount: "Active",
    no_discount: "No Discount",
    
    // Product Detail Modal
    select_variant: "Select Variant Size",
    dealer_price: "Dealer Price",
    offer_mrp: "Offer MRP",
    in_stock_status: "In Stock Status: {count} units",
    key_highlights: "Product Key Highlights",
    default_highlights: "High-performance authentic build quality with official brand warranty check. Contact us for direct bulk details.",
    total_selection: "Total Selection",
    tap_to_zoom: "Tap image to Zoom In / Out. Use arrows to change photos.",
    quick_add_1: "+1 to Cart",
    to_unlock: "to unlock offer",
    
    // Schemes & Offers
    active_scheme_offer: "ACTIVE SCHEME & OFFER",
    schemes_available: "{count} Offer Available",
    schemes_available_plural: "{count} Offers Available",
    reward: "Reward",
    min_target: "Min Target: {count} units",
    cart_added: "Currently in Cart: {count} / {required}",
    offer_unlocked: "OFFER UNLOCKED!",
    add_more_for_offer: "Add {count} more for Offer",
    add_more_for_offer_msg: "Add {count} more units to unlock: {reward}!",
    offer_congrats: "Congratulations! You qualify for {reward} with this order",
    min_units_for_offer: "Min {count} units for Offer",
    all_schemes_title: "Active Dealer Schemes & Bulk Discounts",
    all_schemes_subtitle: "Special offers, buy-more-get-more deals and gifting combos",
    view_products: "View Products",
    no_active_schemes: "No active schemes right now.",
    
    // Cart Screen
    cart_title: "Shopping Cart",
    cart_empty: "Your Cart is Empty",
    go_to_catalog: "Go to Catalog",
    subtotal: "Subtotal",
    final_amount: "Final Amount",
    confirm_order: "CONFIRM ORDER",
    order_confirmed: "ORDER CONFIRMED!",
    order_remarks_title: "📝 Add Order Remarks (Optional)",
    order_remarks_placeholder: "Any specific instructions or requests...",
    payment_mode_title: "Choose Payment Mode",
    payment_cod: "Cash on Delivery (COD)",
    payment_upi: "Pay via PhonePe UPI",
    payment_daily: "Daily Collection (Auto-Pay)",
    scan_pay_exact: "Scan & Pay Exactly:",
    upi_no: "UPI NO:",
    upload_screenshot: "Upload Screenshot after payment to confirm order",
    screenshot_ready: "Screenshot Uploaded & Ready",
    need_more_for_reward: "Need {count} more for {reward}",
    free_item: "FREE ITEM",
    combo_applied: "Combo Offer Applied",
    
    // Help Ticket & Multi-Item Replacement
    help_title: "Help Ticket & Replacements",
    help_subtitle: "Raise issues, replacement requests or delivery queries",
    tab_new_ticket: "➕ New Ticket",
    tab_track_ticket: "📋 Track Tickets",
    select_ticket_type: "Select Ticket Type",
    multi_item_heading: "📦 Multi-Item Replacement List",
    multi_item_subheading: "Add all defective or replacement items into one single ticket",
    select_brand: "Select Brand",
    select_product: "Select Product",
    search_product_barcode: "Search by product name or item code...",
    defect_type: "Defect / Issue Type",
    select_defect: "Select Defect",
    quantity: "Quantity",
    add_item_to_ticket: "➕ Add Item to Ticket",
    items_in_ticket: "Items Added in this Ticket ({count})",
    no_items_added: "No items added yet. Fill above and click Add Item.",
    remove_item: "Remove",
    general_issue_type: "Issue Sub-Type",
    ref_number: "Order / Invoice Ref Number (Optional)",
    ref_placeholder: "e.g. ORD-1024 or Bill No.",
    ticket_remarks: "Problem Details / Remarks",
    ticket_remarks_placeholder: "Explain the issue in detail so our team can resolve it quickly...",
    upload_photo: "Upload Clear Photo Proof of Product / Box",
    photo_uploaded: "Photo uploaded & ready",
    submit_ticket: "SUBMIT HELP TICKET",
    ticket_history_title: "Your Past Help & Replacement Tickets",
    no_tickets_found: "No tickets raised yet.",
    ticket_status_raised: "Raised",
    ticket_status_in_progress: "In Progress",
    ticket_status_approved: "Approved",
    ticket_status_rejected: "Rejected",
    ticket_status_resolved: "Resolved",
    ticket_id: "Ticket ID",
    ticket_date: "Date",
    
    // Ledger & Orders
    account_summary: "Account Summary",
    outstanding_bal: "Outstanding Balance",
    total_bills: "Total Bills",
    total_paid: "Total Paid",
    outstanding: "Outstanding",
    ledger_entries: "Ledger Entries",
    no_ledger_record: "No ledger records found.",
    download_ledger_pdf: "📥 DOWNLOAD LEDGER PDF",
    my_past_orders: "My Past Orders",
    no_orders_record: "No past orders found.",
    order_docs: "Order Documents & Tracking"
  },
  
  hi: {
    // Top Bar & Header
    app_title: "यश मार्केटिंग",
    authorized_portal: "अधिकृत डीलर पोर्टल",
    customer_mode: "ग्राहक",
    dealer_mode: "डीलर",
    logout: "लॉगआउट",
    secure_login: "सुरक्षित लॉगिन",
    enter_10_digit: "10 अंकों का मोबाइल नंबर दर्ज करें",
    mobile_no_placeholder: "मोबाइल नंबर",
    invalid_number: "अमान्य मोबाइल नंबर",
    select_language: "भाषा चुनें",
    language: "भाषा",
    change_language_instruction: "👉 भाषा बदलने के लिए यहाँ क्लिक करें:",
    
    // Bottom Nav
    nav_home: "होम",
    nav_offers: "ऑफ़र्स",
    nav_orders: "ऑर्डर्स",
    nav_ledger: "खाताबही",
    nav_help: "हेल्प टिकट",
    nav_cart: "कार्ट",
    
    // Catalog / Home Screen
    search_placeholder: "सामान, ब्रांड खोजें...",
    select_category: "केटेगरी चुनें",
    all_brands: "सभी ब्रांड्स",
    sort_high_low: "मूल्य: अधिक से कम",
    sort_low_high: "मूल्य: कम से अधिक",
    out_of_stock: "स्टॉक समाप्त",
    item_out_of_stock: "यह सामान अभी स्टॉक में नहीं है",
    on_order: "ऑर्डर पर",
    on_order_desc: "ऑर्डर पर (अगले दिन उपलब्ध)",
    new_badge: "नया",
    offer_badge: "ऑफ़र",
    add_btn: "+ जोड़ें",
    add_next_day_btn: "+ जोड़ें (अगले दिन)",
    add_to_order: "🛒 कार्ट में जोड़ें",
    add_to_order_next_day: "🛒 कार्ट में जोड़ें (अगले दिन)",
    add_to_cart: "🛒 कार्ट में जोड़ें",
    share_photo: "फ़ोटो साझा करें",
    share_with_dealer: "डीलर के साथ फ़ोटो साझा करें",
    contact_us: "संपर्क करें",
    mrp: "एमआरपी",
    off: "छूट",
    view_cart: "कार्ट देखें  ",
    total_qty: "कुल नग",
    syncing_inventory: "इन्वेंट्री लोड हो रही है...",
    inventory_failed: "इन्वेंट्री लोड नहीं हो सकी",
    force_refresh: "पुनः ताज़ा करें",
    no_categories: "केटेगरी उपलब्ध नहीं हैं।",
    no_products_filter: "इस फ़िल्टर के लिए कोई सामान नहीं मिला।",
    bulk_tracker: "थोक डिस्काउंट ट्रैकर",
    active_discount: "सक्रिय",
    no_discount: "कोई छूट नहीं",
    
    // Product Detail Modal
    select_variant: "वैरिएंट साइज चुनें",
    dealer_price: "डीलर मूल्य",
    offer_mrp: "ऑफ़र एमआरपी",
    in_stock_status: "स्टॉक स्थिति: {count} नग",
    key_highlights: "उत्पाद की मुख्य विशेषताएं",
    default_highlights: "ब्रांड वारंटी के साथ उच्च गुणवत्ता का प्रामाणिक उत्पाद। थोक विवरण के लिए संपर्क करें।",
    total_selection: "कुल चयन",
    tap_to_zoom: "फ़ोटो बड़ी करने के लिए टैप करें।",
    quick_add_1: "+1 कार्ट में",
    to_unlock: "और जोड़कर ऑफर पाएं",
    
    // Schemes & Offers
    active_scheme_offer: "सक्रिय स्कीम और ऑफ़र",
    schemes_available: "{count} ऑफ़र उपलब्ध",
    schemes_available_plural: "{count} ऑफ़र्स उपलब्ध",
    reward: "इनाम / मुफ़्त",
    min_target: "न्यूनतम लक्ष्य: {count} पीस",
    cart_added: "कार्ट में जोड़ा गया: {count} / {required}",
    offer_unlocked: "ऑफ़र अनलॉक हो गया!",
    add_more_for_offer: "ऑफ़र के लिए {count} और जोड़ें",
    add_more_for_offer_msg: "मात्र {count} पीस और जोड़ें और पाएं: {reward}!",
    offer_congrats: "बधाई हो! इस ऑर्डर के साथ आपको {reward} मिलेगा",
    min_units_for_offer: "न्यूनतम {count} पीस",
    all_schemes_title: "सक्रिय डीलर स्कीम्स और बल्क डिस्काउंट",
    all_schemes_subtitle: "विशेष ऑफ़र, बाय-मोर-गेट-मोर और गिफ्टिंग कॉम्बो",
    view_products: "सामान देखें",
    no_active_schemes: "वर्तमान में कोई सक्रिय स्कीम नहीं है।",
    
    // Cart Screen
    cart_title: "शॉपिंग कार्ट",
    cart_empty: "आपकी कार्ट खाली है",
    go_to_catalog: "कैटलॉग पर जाएं",
    subtotal: "उप-योग",
    final_amount: "अंतिम राशि",
    confirm_order: "ऑर्डर कन्फ़र्म करें",
    order_confirmed: "ऑर्डर कन्फ़र्म हो गया!",
    order_remarks_title: "📝 ऑर्डर टिप्पणी (वैकल्पिक)",
    order_remarks_placeholder: "कोई विशेष निर्देश या अनुरोध...",
    payment_mode_title: "भुगतान का प्रकार चुनें",
    payment_cod: "कैश ऑन डिलीवरी (COD)",
    payment_upi: "PhonePe UPI द्वारा भुगतान",
    payment_daily: "दैनिक वसूली (Auto-Pay)",
    scan_pay_exact: "स्कैन करके ठीक भुगतान करें:",
    upi_no: "UPI नंबर:",
    upload_screenshot: "ऑर्डर कन्फ़र्म करने के लिए स्क्रीनशॉट अपलोड करें",
    screenshot_ready: "स्क्रीनशॉट तैयार है",
    need_more_for_reward: "{reward} के लिए {count} और चाहिए",
    free_item: "मुफ़्त सामान",
    combo_applied: "कॉम्बो ऑफ़र लागू",
    
    // Help Ticket & Multi-Item Replacement
    help_title: "हेल्प टिकट और रिप्लेसमेंट",
    help_subtitle: "खराबी, रिप्लेसमेंट या डिलीवरी संबंधी सहायता",
    tab_new_ticket: "➕ नया टिकट",
    tab_track_ticket: "📋 टिकट ट्रैक करें",
    select_ticket_type: "टिकट का प्रकार चुनें",
    multi_item_heading: "📦 मल्टी-आइटम रिप्लेसमेंट लिस्ट",
    multi_item_subheading: "एक ही टिकट में सभी खराब सामान जोड़ें",
    select_brand: "ब्रांड चुनें",
    select_product: "सामान चुनें",
    search_product_barcode: "सामान का नाम या कोड खोजें...",
    defect_type: "समस्या का प्रकार",
    select_defect: "दोष चुनें",
    quantity: "मात्रा (पीस)",
    add_item_to_ticket: "➕ टिकट में सामान जोड़ें",
    items_in_ticket: "इस टिकट में जोड़े गए सामान ({count})",
    no_items_added: "अभी कोई सामान नहीं जोड़ा गया। ऊपर भरें और 'टिकट में सामान जोड़ें' दबाएं।",
    remove_item: "हटाएं",
    general_issue_type: "समस्या उप-प्रकार",
    ref_number: "ऑर्डर / बिल नंबर (वैकल्पिक)",
    ref_placeholder: "उदा. ORD-1024 या बिल नंबर",
    ticket_remarks: "समस्या का विवरण / टिप्पणी",
    ticket_remarks_placeholder: "समस्या का पूरा विवरण लिखें ताकि हमारी टीम तुरंत समाधान कर सके...",
    upload_photo: "सामान / बॉक्स की साफ़ फ़ोटो अपलोड करें",
    photo_uploaded: "फ़ोटो तैयार है",
    submit_ticket: "हेल्प टिकट सबमिट करें",
    ticket_history_title: "आपके पिछले हेल्प और रिप्लेसमेंट टिकट",
    no_tickets_found: "अभी कोई टिकट दर्ज नहीं है।",
    ticket_status_raised: "दर्ज हुआ",
    ticket_status_in_progress: "प्रक्रिया में",
    ticket_status_approved: "स्वीकृत",
    ticket_status_rejected: "अस्वीकृत",
    ticket_status_resolved: "समाधान हुआ",
    ticket_id: "टिकट आईडी",
    ticket_date: "दिनांक",
    
    // Ledger & Orders
    account_summary: "खाता सारांश",
    outstanding_bal: "बकाया राशि",
    total_bills: "कुल बिल",
    total_paid: "कुल भुगतान",
    outstanding: "बकाया",
    ledger_entries: "खाताबही प्रविष्टियां",
    no_ledger_record: "कोई खाता रिकॉर्ड नहीं मिला।",
    download_ledger_pdf: "📥 खाताबही PDF डाउनलोड करें",
    my_past_orders: "मेरी पिछली ऑर्डर्स",
    no_orders_record: "कोई पिछली ऑर्डर नहीं मिली।",
    order_docs: "ऑर्डर दस्तावेज़ और ट्रैकिंग",
    something_went_wrong: "कुछ तकनीकी समस्या आई",
    technical_issue_desc: "कृपया पुनः प्रयास करें या कैटलॉग पर जाएं।",
    reload_app: "🔄 पुनः लोड करें / कैटलॉग पर जाएं"
  },
  
  mr: {
    // Top Bar & Header
    app_title: "यश मार्केटिंग",
    authorized_portal: "अधिकृत डीलर पोर्टल",
    customer_mode: "ग्राहक",
    dealer_mode: "डीलर",
    logout: "लॉगआउट",
    secure_login: "सुरक्षित लॉगिन",
    enter_10_digit: "10 अंकी मोबाइल नंबर टाका",
    mobile_no_placeholder: "मोबाइल नंबर",
    invalid_number: "अवैध मोबाइल नंबर",
    select_language: "भाषा निवडा",
    language: "भाषा",
    change_language_instruction: "👉 भाषा बदलण्यासाठी येथे क्लिक करा:",
    
    // Bottom Nav
    nav_home: "होम",
    nav_offers: "ऑफ़र्स",
    nav_orders: "ऑर्डर्स",
    nav_ledger: "खातावही",
    nav_help: "हेल्प तिकीट",
    nav_cart: "कार्ट",
    
    // Catalog / Home Screen
    search_placeholder: "उत्पादने, ब्रँड शोधा...",
    select_category: "वर्गवारी निवडा",
    all_brands: "सर्व ब्रँड्स",
    sort_high_low: "किंमत: जास्त ते कमी",
    sort_low_high: "किंमत: कमी ते जास्त",
    out_of_stock: "स्टॉक संपला",
    item_out_of_stock: "हा माल सध्या स्टॉकमध्ये नाही",
    on_order: "ऑर्डरवर",
    on_order_desc: "ऑर्डरवर (दुसऱ्या दिवशी उपलब्ध)",
    new_badge: "नवीन",
    offer_badge: "ऑफ़र",
    add_btn: "+ जोडा",
    add_next_day_btn: "+ जोडा (दुसऱ्या दिवशी)",
    add_to_order: "🛒 कार्ट मध्ये जोडा",
    add_to_order_next_day: "🛒 कार्ट मध्ये जोडा (दुसऱ्या दिवशी)",
    add_to_cart: "🛒 कार्ट मध्ये जोडा",
    share_photo: "फोटो शेअर करा",
    share_with_dealer: "डीलरला फोटो शेअर करा",
    contact_us: "संपर्क करा",
    mrp: "एमआरपी",
    off: "सूट",
    view_cart: "कार्ट पहा  ",
    total_qty: "एकूण नग",
    syncing_inventory: "इन्व्हेंटरी लोड होत आहे...",
    inventory_failed: "इन्व्हेंटरी लोड होऊ शकली नाही",
    force_refresh: "पुन्हा ताजे करा",
    no_categories: "वर्गवारी उपलब्ध नाही.",
    no_products_filter: "या फिल्टरसाठी उत्पादने सापडली नाहीत.",
    bulk_tracker: "मोठ्या खरेदीवर डिस्काउंट ट्रॅकर",
    active_discount: "सक्रिय",
    no_discount: "सूट नाही",
    
    // Product Detail Modal
    select_variant: "व्हेरिएंट निवडा",
    dealer_price: "डीलर किंमत",
    offer_mrp: "ऑफ़र एमआरपी",
    in_stock_status: "स्टॉक स्थिती: {count} नग",
    key_highlights: "उत्पादनाची ठळक वैशिष्ट्ये",
    default_highlights: "अधिकृत ब्रँड वॉरंटीसह अस्सल गुणवत्ता. मोठ्या खरेदीसाठी थेट संपर्क साधा.",
    total_selection: "एकूण निवड",
    tap_to_zoom: "फोटो मोठा करण्यासाठी टॅप करा.",
    quick_add_1: "+1 कार्ट मध्ये",
    to_unlock: "अजून जोडून ऑफर मिळवा",
    
    // Schemes & Offers
    active_scheme_offer: "सक्रिय योजना आणि ऑफ़र",
    schemes_available: "{count} ऑफ़र उपलब्ध",
    schemes_available_plural: "{count} ऑफ़र्स उपलब्ध",
    reward: "बक्षीस / मोफत",
    min_target: "किमान उद्दिष्ट: {count} नग",
    cart_added: "कार्टमध्ये जोडले: {count} / {required}",
    offer_unlocked: "ऑफ़र अनलॉक झाली!",
    add_more_for_offer: "ऑफ़रसाठी अजून {count} जोडा",
    add_more_for_offer_msg: "फक्त {count} नग अजून जोडा आणि मिळवा: {reward}!",
    offer_congrats: "अभिनंदन! या ऑर्डरसोबत आपल्याला {reward} मिळेल",
    min_units_for_offer: "किमान {count} नग",
    all_schemes_title: "सक्रिय डीलर स्कीम्स आणि बल्क डिस्काउंट",
    all_schemes_subtitle: "विशेष ऑफ़र्स, बाय-मोर-गेट-मोर आणि गिफ्टिंग कॉम्बो",
    view_products: "उत्पादने पहा",
    no_active_schemes: "सध्या कोणतीही सक्रिय स्कीम नाही.",
    
    // Cart Screen
    cart_title: "शॉपिंग कार्ट",
    cart_empty: "आपली कार्ट रिकामी आहे",
    go_to_catalog: "कॅटलॉगवर जा",
    subtotal: "एकूण",
    final_amount: "अंतिम रक्कम",
    confirm_order: "ऑर्डर निश्चित करा",
    order_confirmed: "ऑर्डर निश्चित झाली!",
    order_remarks_title: "📝 ऑर्डरसाठी टीप (ऐच्छिक)",
    order_remarks_placeholder: "काही विशेष सूचना किंवा विनंती असल्यास येथे लिहा...",
    payment_mode_title: "पेमेंट पर्याय निवडा",
    payment_cod: "कॅश ऑन डिलिव्हरी (COD)",
    payment_upi: "PhonePe UPI द्वारे पेमेंट",
    payment_daily: "दैनिक वसुली (Auto-Pay)",
    scan_pay_exact: "स्कॅन करून अचूक रक्कम भरा:",
    upi_no: "UPI नंबर:",
    upload_screenshot: "ऑर्डर निश्चित करण्यासाठी स्क्रीनशॉट अपलोड करा",
    screenshot_ready: "स्क्रीनशॉट अपलोड झाला",
    need_more_for_reward: "{reward} साठी अजून {count} हवे",
    free_item: "मोफत माल",
    combo_applied: "कॉम्बो ऑफ़र लागू",
    
    // Help Ticket & Multi-Item Replacement
    help_title: "हेल्प तिकीट आणि रिप्लेसमेंट",
    help_subtitle: "दोषी माल, रिप्लेसमेंट किंवा डिलिव्हरी संदर्भातील तक्रारी",
    tab_new_ticket: "➕ नवीन तिकीट",
    tab_track_ticket: "📋 तिकीट तपासा",
    select_ticket_type: "तिकीटाचा प्रकार निवडा",
    multi_item_heading: "📦 मल्टी-आयटम रिप्लेसमेंट यादी",
    multi_item_subheading: "एकाच तिकिटात एकापेक्षा जास्त खराब उत्पादने जोडा",
    select_brand: "ब्रँड निवडा",
    select_product: "उत्पादन निवडा",
    search_product_barcode: "उत्पादनाचे नाव किंवा कोड शोधा...",
    defect_type: "समस्येचा प्रकार",
    select_defect: "दोष निवडा",
    quantity: "प्रमाण (नग)",
    add_item_to_ticket: "➕ तिकीट मध्ये आयटम जोडा",
    items_in_ticket: "या तिकिटामध्ये जोडलेले आयटम ({count})",
    no_items_added: "अजून कोणताही माल जोडलेला नाही. वर माहिती भरा आणि 'तिकीट मध्ये आयटम जोडा' दाबा.",
    remove_item: "काढून टाका",
    general_issue_type: "समस्या उप-प्रकार",
    ref_number: "ऑर्डर / बिल क्रमांक (ऐच्छिक)",
    ref_placeholder: "उदा. ORD-1024 किंवा बिल नंबर",
    ticket_remarks: "समस्येचा तपशील / टीप",
    ticket_remarks_placeholder: "समस्येचा सविस्तर तपशील लिहा जेणेकरून आमची टीम त्वरित सोडवू शकेल...",
    upload_photo: "उत्पादन / बॉक्सचा स्पष्ट फोटो अपलोड करा",
    photo_uploaded: "फोटो अपलोड झाला व तयार आहे",
    submit_ticket: "हेल्प तिकीट सबमिट करा",
    ticket_history_title: "आपली मागील हेल्प आणि रिप्लेसमेंट तिकिटे",
    no_tickets_found: "अद्याप कोणतीही तिकिटे नोंदवलेली नाहीत.",
    ticket_status_raised: "नोंदवले",
    ticket_status_in_progress: "प्रक्रियेत",
    ticket_status_approved: "मंजूर",
    ticket_status_rejected: "नाकारले",
    ticket_status_resolved: "सोडवले",
    ticket_id: "तिकीट आयडी",
    ticket_date: "तारीख",
    
    // Ledger & Orders
    account_summary: "खाते सारांश",
    outstanding_bal: "उर्वरित बाकी",
    total_bills: "एकूण बिले",
    total_paid: "एकूण भरणा",
    outstanding: "उर्वरित बाकी",
    ledger_entries: "खातावही नोंदी",
    no_ledger_record: "कोणतीही नोंद सापडली नाही.",
    download_ledger_pdf: "📥 खातावही PDF डाउनलोड करा",
    my_past_orders: "माझ्या मागील ऑर्डर्स",
    no_orders_record: "कोणतीही मागील ऑर्डर आढळली नाही.",
    order_docs: "ऑर्डर कागदपत्रे आणि ट्रॅकिंग",
    something_went_wrong: "काहीतरी तांत्रिक त्रुटी आली",
    technical_issue_desc: "कृपया पुन्हा प्रयत्न करा किंवा कॅटलॉगवर परत जा.",
    reload_app: "🔄 पुन्हा लोड करा / कॅटलॉगवर जा"
  }
};

export function t(key, lang = 'en', params = {}) {
  const currentLang = translations[lang] ? lang : 'en';
  let text = translations[currentLang][key] || translations['en'][key] || key;
  
  if (params && typeof params === 'object') {
    Object.keys(params).forEach(p => {
      text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
    });
  }
  return text;
}

// Dynamic Scheme and Offer message translator
export function translateOfferText(msg, lang = 'en') {
  if (!msg || lang === 'en') return msg;
  let text = String(msg);

  if (lang === 'mr') {
    if (text.includes("Raincoat")) return "हिकव्हिजन MMC & PD चे २५ नग खरेदी करा आणि मोफत रेनकोट मिळवा!";
    if (text.includes("VIP Trolley Bag")) return "हिकव्हिजन MMC & PD चे ६० नग खरेदी करा आणि मोफत VIP ट्रॉली बॅग (किंमत ₹९९९९/-) मिळवा!";
    if (text.includes("GIFTING COMBO")) return "गिफ्टिंग कॉम्बो - व्हेलॉसिटी नेकबँड + एअरपॉड्स कॉम्बो फक्त ₹४०० मध्ये!";
    if (text.includes("A325") && text.includes("20 Free")) return "बोट केबल A325 - २० नग खरेदी करा आणि २० नग मोफत मिळवा!";
    if (text.includes("A325") && text.includes("75 Free")) return "बोट केबल A325 - ५० नग खरेदी करा आणि ७५ नग मोफत मिळवा!";
    if (text.includes("65w") && text.includes("30 Free")) return "बोट टाइप C to C ६५W केबल - २० नग खरेदी करा आणि ३० नग A325 केबल मोफत मिळवा!";
    if (text.includes("65w") && text.includes("100 Free")) return "बोट टाइप C to C ६५W केबल - ५० नग खरेदी करा आणि १०० नग A325 केबल मोफत मिळवा!";
    if (text.includes("Astra")) return "अस्त्रा ३, अस्त्रा ४, अस्त्रा निओ - १० नग खरेदी करा आणि १ नग मोफत मिळवा!";
    if (text.includes("Summit")) return "समिट, स्ट्राइव्ह, बोल्ड, २६१ प्रो - १० नग खरेदी करा आणि १ नग मोफत मिळवा!";

    text = text.replace(/Buy\s+(\d+)\s*(?:Pcs|units)?\s*(?:of\s+)?([^,]+?),\s*get\s+(?:a\s+free\s+)?(.+)/i, '$2 चे $1 नग खरेदी करा आणि मोफत $3 मिळवा!');
    text = text.replace(/Buy\s+(\d+)\s+get\s+(\d+)\s+Free/i, '$1 नग खरेदी करा आणि $2 नग मोफत मिळवा!');
    text = text.replace(/Buy\s+(\d+)\s+get\s+(.+)\s+Free/i, '$1 नग खरेदी करा आणि $2 मोफत मिळवा!');
  } else if (lang === 'hi') {
    if (text.includes("Raincoat")) return "हिकविज़न MMC & PD के २५ पीस खरीदें और मुफ़्त रेनकोट पाएं!";
    if (text.includes("VIP Trolley Bag")) return "हिकविज़न MMC & PD के ६० पीस खरीदें और मुफ़्त VIP ट्रॉली बैग (मूल्य ₹९९९९/-) पाएं!";
    if (text.includes("GIFTING COMBO")) return "गिफ्टिंग कॉम्बो - वेलोसिटी नेकबैंड + एयरपॉड्स कॉम्बो सिर्फ़ ₹४०० में!";
    if (text.includes("A325") && text.includes("20 Free")) return "बोट केबल A325 - २० पीस खरीदें और २० पीस मुफ़्त पाएं!";
    if (text.includes("A325") && text.includes("75 Free")) return "बोट केबल A325 - ५० पीस खरीदें और ७५ पीस मुफ़्त पाएं!";
    if (text.includes("65w") && text.includes("30 Free")) return "बोट टाइप C to C ६५W केबल - २० पीस खरीदें और ३० पीस A325 केबल मुफ़्त पाएं!";
    if (text.includes("65w") && text.includes("100 Free")) return "बोट टाइप C to C ६५W केबल - ५० पीस खरीदें और १०० पीस A325 केबल मुफ़्त पाएं!";
    if (text.includes("Astra")) return "एस्ट्रा ३, एस्ट्रा ४, एस्ट्रा नियो - १० पीस खरीदें और १ पीस मुफ़्त पाएं!";
    if (text.includes("Summit")) return "समिट, स्ट्राइव, बोल्ड, २६१ प्रो - १० पीस खरीदें और १ पीस मुफ़्त पाएं!";

    text = text.replace(/Buy\s+(\d+)\s*(?:Pcs|units)?\s*(?:of\s+)?([^,]+?),\s*get\s+(?:a\s+free\s+)?(.+)/i, '$2 के $1 पीस खरीदें और मुफ़्त $3 पाएं!');
    text = text.replace(/Buy\s+(\d+)\s+get\s+(\d+)\s+Free/i, '$1 पीस खरीदें और $2 पीस मुफ़्त पाएं!');
    text = text.replace(/Buy\s+(\d+)\s+get\s+(.+)\s+Free/i, '$1 पीस खरीदें और $2 मुफ़्त पाएं!');
  }
  return text;
}

// Dynamic Reward Translator
export function translateReward(reward, lang = 'en') {
  if (!reward || lang === 'en') return reward;
  const str = String(reward);
  if (lang === 'mr') {
    if (str.includes("Raincoat")) return "रेनकोट";
    if (str.includes("VIP Trolley Bag")) return "VIP ट्रॉली बॅग (किंमत ₹९९९९/-)";
    if (str.includes("100 Rs Discount")) return "₹१०० डिस्काउंट / सूट!";
    return str.replace(/(\d+)\s*Pcs/i, '$1 नग मोफत');
  } else if (lang === 'hi') {
    if (str.includes("Raincoat")) return "रेनकोट";
    if (str.includes("VIP Trolley Bag")) return "VIP ट्रॉली बैग (मूल्य ₹९९९९/-)";
    if (str.includes("100 Rs Discount")) return "₹१०० की विशेष छूट!";
    return str.replace(/(\d+)\s*Pcs/i, '$1 पीस मुफ़्त');
  }
  return str;
}

// Dynamic Category Translator
export function translateCategory(cat, lang = 'en') {
  if (!cat || lang === 'en') return cat;
  const c = String(cat).trim();
  const catMap = {
    'Boat Airpods': { mr: 'बोट एअरपॉड्स', hi: 'बोट एयरपॉड्स' },
    'Boat Neckband': { mr: 'बोट नेकबँड', hi: 'बोट नेकबैंड' },
    'Boat Smart Watch': { mr: 'बोट स्मार्ट वॉच', hi: 'बोट स्मार्ट वॉच' },
    'Boat Cables': { mr: 'बोट केबल्स', hi: 'बोट केबल्स' },
    'Boat Charger': { mr: 'बोट चार्जर', hi: 'बोट चार्जर' },
    'Boat Power Bank': { mr: 'बोट पॉवर बँक', hi: 'बोट पावर बैंक' },
    'Boat Earphone': { mr: 'बोट इयरफोन', hi: 'बोट इयरफ़ोन' },
    'Boat Speaker': { mr: 'बोट स्पीकर्स', hi: 'बोट स्पीकर्स' },
    'HV EXTERNAL SSD': { mr: 'हिकव्हिजन एक्सटर्नल एसएसडी', hi: 'हिकविज़न एक्सटर्नल एसएसडी' },
    'HV MEMORY CARD': { mr: 'हिकव्हिजन मेमरी कार्ड', hi: 'हिकविज़न मेमोरी कार्ड' },
    'Velocity Neckband': { mr: 'व्हेलॉसिटी नेकबँड', hi: 'वेलोसिटी नेकबैंड' },
    'Velocity Airpods': { mr: 'व्हेलॉसिटी एअरपॉड्स', hi: 'वेलोसिटी एयरपॉड्स' },
    'Airpods': { mr: 'एअरपॉड्स', hi: 'एयरपॉड्स' },
    'Neckband': { mr: 'नेकबँड', hi: 'नेकबैंड' },
    'Smart Watch': { mr: 'स्मार्ट वॉच', hi: 'स्मार्ट वॉच' },
    'Cables': { mr: 'केबल्स', hi: 'केबल्स' },
    'Hardisk': { mr: 'हार्ड डिस्क', hi: 'हार्ड डिस्क' },
    'MMC & PD': { mr: 'मेमरी कार्ड आणि पेन ड्राइव्ह', hi: 'मेमोरी कार्ड और पेन ड्राइव' }
  };

  if (catMap[c] && catMap[c][lang]) return catMap[c][lang];
  return c;
}

// Dynamic Product Name Translator
export function translateProductName(name, lang = 'en') {
  if (!name || lang === 'en') return name;
  let text = String(name);

  const replacements = lang === 'mr' ? [
    [/\bboAt\b/gi, 'बोट'],
    [/\bVelocity\b/gi, 'व्हेलॉसिटी'],
    [/\bHikvision\b/gi, 'हिकव्हिजन'],
    [/\bNeckband\b/gi, 'नेकबँड'],
    [/\bAirpods\b/gi, 'एअरपॉड्स'],
    [/\bEarphone(?:s)?\b/gi, 'इयरफोन'],
    [/\bEarbuds\b/gi, 'इअरबड्स'],
    [/\bHeadphone(?:s)?\b/gi, 'हेडफोन'],
    [/\bSmart Watch\b/gi, 'स्मार्ट वॉच'],
    [/\bWatch\b/gi, 'वॉच'],
    [/\bCable(?:s)?\b/gi, 'केबल'],
    [/\bCharger(?:s)?\b/gi, 'चार्जर'],
    [/\bPower Bank\b/gi, 'पॉवर बँक'],
    [/\bSpeaker(?:s)?\b/gi, 'स्पीकर'],
    [/\bMemory Card\b/gi, 'मेमरी कार्ड'],
    [/\bPen Drive\b/gi, 'पेन ड्राइव्ह'],
    [/\bHard Disk\b/gi, 'हार्ड डिस्क'],
    [/\bExternal SSD\b/gi, 'एक्सटर्नल एसएसडी'],
    [/\bBoss\b/gi, 'बॉस'],
    [/\bWave\b/gi, 'वेव्ह'],
    [/\bAstra\b/gi, 'अस्त्रा'],
    [/\bRockerz\b/gi, 'रॉकर्स'],
    [/\bSummit\b/gi, 'समिट'],
    [/\bStrive\b/gi, 'स्ट्राइव्ह'],
    [/\bBold\b/gi, 'बोल्ड'],
    [/\bPro\b/gi, 'प्रो'],
    [/\bNeo\b/gi, 'निओ'],
    [/\bActive\b/gi, 'ॲक्टिव्ह'],
    [/\bClassic\b/gi, 'क्लासिक'],
    [/\bCarbon\b/gi, 'कार्बन'],
    [/\bBlack\b/gi, 'ब्लॅक'],
    [/\bWhite\b/gi, 'व्हाईट'],
    [/\bBlue\b/gi, 'ब्लू'],
    [/\bRed\b/gi, 'रेड'],
    [/\bGreen\b/gi, 'ग्रीन'],
    [/\bGrey|Gray\b/gi, 'ग्रे'],
    [/\bType C\b/gi, 'टाइप सी'],
    [/\bMicro USB\b/gi, 'मायक्रो यूएसबी'],
    [/\bLightning\b/gi, 'लाइटनिंग']
  ] : [
    [/\bboAt\b/gi, 'बोट'],
    [/\bVelocity\b/gi, 'वेलोसिटी'],
    [/\bHikvision\b/gi, 'हिकविज़न'],
    [/\bNeckband\b/gi, 'नेकबैंड'],
    [/\bAirpods\b/gi, 'एयरपॉड्स'],
    [/\bEarphone(?:s)?\b/gi, 'इयरफ़ोन'],
    [/\bEarbuds\b/gi, 'इयरबड्स'],
    [/\bHeadphone(?:s)?\b/gi, 'हेडफ़ोन'],
    [/\bSmart Watch\b/gi, 'स्मार्ट वॉच'],
    [/\bWatch\b/gi, 'वॉच'],
    [/\bCable(?:s)?\b/gi, 'केबल'],
    [/\bCharger(?:s)?\b/gi, 'चार्जर'],
    [/\bPower Bank\b/gi, 'पावर बैंक'],
    [/\bSpeaker(?:s)?\b/gi, 'स्पीकर'],
    [/\bMemory Card\b/gi, 'मेमोरी कार्ड'],
    [/\bPen Drive\b/gi, 'पेन ड्राइव'],
    [/\bHard Disk\b/gi, 'हार्ड डिस्क'],
    [/\bExternal SSD\b/gi, 'एक्सटर्नल एसएसडी'],
    [/\bBoss\b/gi, 'बॉस'],
    [/\bWave\b/gi, 'वेव'],
    [/\bAstra\b/gi, 'एस्ट्रा'],
    [/\bRockerz\b/gi, 'रॉकर्स'],
    [/\bSummit\b/gi, 'समिट'],
    [/\bStrive\b/gi, 'स्ट्राइव'],
    [/\bBold\b/gi, 'बोल्ड'],
    [/\bPro\b/gi, 'प्रो'],
    [/\bNeo\b/gi, 'नियो'],
    [/\bActive\b/gi, 'एक्टिव'],
    [/\bClassic\b/gi, 'क्लासिक'],
    [/\bCarbon\b/gi, 'कार्बन'],
    [/\bBlack\b/gi, 'ब्लैक'],
    [/\bWhite\b/gi, 'व्हाइट'],
    [/\bBlue\b/gi, 'ब्लू'],
    [/\bRed\b/gi, 'रेड'],
    [/\bGreen\b/gi, 'ग्रीन'],
    [/\bGrey|Gray\b/gi, 'ग्रे'],
    [/\bType C\b/gi, 'टाइप सी'],
    [/\bMicro USB\b/gi, 'माइक्रो यूएसबी'],
    [/\bLightning\b/gi, 'लाइटनिंग']
  ];

  for (const [regex, repl] of replacements) {
    text = text.replace(regex, repl);
  }
  return text;
}
