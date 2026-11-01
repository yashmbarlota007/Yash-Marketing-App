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
    all_categories: "All Categories",
    sort_high_low: "Price: High to Low",
    sort_low_high: "Price: Low to High",
    out_of_stock: "Out of Stock",
    item_out_of_stock: "ITEM CURRENTLY OUT OF STOCK",
    on_order: "ON ORDER",
    on_order_badge: "ON ORDER",
    on_order_badge_desc: "Available Next Day",
    on_order_desc: "ON ORDER (Available Next Day)",
    new_badge: "NEW",
    offer_badge: "SPECIAL OFFER",
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
    view_cart: "VIEW CART 🛒",
    total_qty: "Total Qty",
    syncing_inventory: "Syncing Inventory...",
    inventory_failed: "Inventory Sync Failed",
    force_refresh: "FORCE REFRESH",
    no_categories: "Categories found empty.",
    no_products_filter: "No products found for this filter.",
    bulk_tracker: "Bulk Discount Tracker",
    active_discount: "Active",
    no_discount: "No Discount",
    clear_filters: "Clear Filters",
    
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
    specs: "Specifications",
    brand_label: "Brand",
    category_label: "Category",
    item_code_label: "Item Code",
    warranty_info: "Warranty Check",
    
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
    active_target_rewards: "Active Target Rewards",
    exclusive_deals_title: "Exclusive Deals & Offers",
    exclusive_deals_desc: "Maximize your margins with active wholesale schemes.",
    combo_scheme: "COMBO SCHEME",
    eligible_products: "Eligible Products",
    add_combo_btn: "⚡ Add 10 Pairs Combo",
    combo_added_alert: "✅ 10 Pairs Combo Added Successfully!",
    savings_badge: "Savings: ₹{amount}",
    
    // Cart Screen
    cart_title: "Shopping Cart",
    cart_empty: "Your Cart is Empty",
    go_to_catalog: "Go to Catalog",
    subtotal: "Subtotal",
    final_amount: "Final Amount",
    net_value: "Net Value",
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
    one_rupee_pc: "₹1 / PC BILLING",
    qty_label: "Qty",
    clear_cart: "Clear Cart",
    
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
    ticket_status_actioned: "Actioned",
    ticket_status_label: "Status",
    ticket_id: "Ticket ID",
    ticket_date: "Date",
    
    // Multi-photo additions
    multi_photo_instruction: "📸 Product Photos (Mandatory - Min 1 photo, Multiple allowed)",
    add_more_photos: "+ Add More Photos",
    photos_count: "{count} Photos Added",
    photo_compulsory_alert: "⚠️ Photo upload is compulsory for this item! Please add at least 1 photo.",
    ticket_items_count: "Total Items: {count}",
    defect_doa: "Dead on Arrival (DOA / Not Starting)",
    defect_sound: "Sound / Speaker Issue",
    defect_mic: "Mic / Calling Problem",
    defect_charging: "Charging / Battery Problem",
    defect_physical: "Physical Damage / Broken",
    defect_other: "Other Technical Fault",
    
    cat_replacement: "Replacement",
    cat_replacement_desc: "Defective or damaged item exchange",
    cat_order_delivery: "Order & Delivery",
    cat_order_delivery_desc: "Dispatch delay, missing item, package issue",
    cat_billing_payment: "Billing & Ledger",
    cat_billing_payment_desc: "Payment not reflected, bill query",
    cat_general_support: "General Support",
    cat_general_support_desc: "Account, scheme, or other enquiry",
    
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
    order_docs: "Order Documents & Tracking",
    order_billing_blueprint: "Items & Billing Blueprint",
    payment_label: "Payment",
    generating_order_history: "Generating Order History...",
    generating_ledger: "Generating Ledger Statement...",
    stock_photo: "Stock Photo",
    invoice_photo: "Invoice Photo",
    box_photo: "Box Photo",
    delivery_proof: "Delivery Proof / POD",
    call_recording: "Call Recording",
    listen_call: "Listen Recording",
    order_rating: "Order Rating",
    payment_proof: "Payment Slip",
    secure_viewer: "Document Viewer",
    close_preview: "Tap anywhere outside to close preview.",
    open_drive_link: "OPEN IN GOOGLE DRIVE ↗",
    debit_label: "DR (Debited / Billed)",
    credit_label: "CR (Credited / Paid)",
    vch_no: "No:"
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
    all_categories: "सभी श्रेणियां",
    sort_high_low: "कीमत: ज्यादा से कम",
    sort_low_high: "कीमत: कम से ज्यादा",
    out_of_stock: "आउट ऑफ स्टॉक",
    item_out_of_stock: "सामान अभी स्टॉक में नहीं है",
    on_order: "ऑर्डर पर",
    on_order_badge: "ऑर्डर पर",
    on_order_badge_desc: "अगले दिन उपलब्ध",
    on_order_desc: "ऑर्डर पर (अगले दिन उपलब्ध)",
    new_badge: "नया",
    offer_badge: "धमाकेदार ऑफ़र",
    add_btn: "+ जोड़ें",
    add_next_day_btn: "+ जोड़ें (अगले दिन)",
    add_to_order: "🛒 कार्ट में जोड़ें",
    add_to_order_next_day: "🛒 कार्ट में जोड़ें (अगले दिन)",
    add_to_cart: "🛒 कार्ट में जोड़ें",
    share_photo: "फ़ोटो शेयर करें",
    share_with_dealer: "डीलर के साथ फ़ोटो शेयर करें",
    contact_us: "संपर्क करें",
    mrp: "एमआरपी",
    off: "छूट",
    view_cart: "कार्ट देखें 🛒",
    total_qty: "कुल मात्रा",
    syncing_inventory: "स्टॉक लोड हो रहा है...",
    inventory_failed: "स्टॉक लोड करने में समस्या आई",
    force_refresh: "रिफ्रेश करें",
    no_categories: "कोई श्रेणी नहीं मिली।",
    no_products_filter: "इस फ़िल्टर में कोई सामान नहीं मिला।",
    bulk_tracker: "थोक छूट ट्रैकर",
    active_discount: "सक्रिय",
    no_discount: "कोई छूट नहीं",
    clear_filters: "फ़िल्टर हटाएं",
    
    // Product Detail Modal
    select_variant: "साइज़ / वैरिएंट चुनें",
    dealer_price: "डीलर कीमत",
    offer_mrp: "ऑफ़र एमआरपी",
    in_stock_status: "स्टॉक स्थिति: {count} पीस",
    key_highlights: "मुख्य विशेषताएं",
    default_highlights: "कंपनी की आधिकारिक वारंटी के साथ मूल उच्च गुणवत्ता वाला उत्पाद। थोक खरीदारी के लिए संपर्क करें।",
    total_selection: "कुल चयन",
    tap_to_zoom: "फ़ोटो बड़ा करने के लिए टैप करें।",
    quick_add_1: "+1 कार्ट में जोड़ें",
    to_unlock: "ऑफ़र अनलॉक करने के लिए",
    specs: "विशिष्टताएं",
    brand_label: "ब्रांड",
    category_label: "श्रेणी",
    item_code_label: "सामान कोड",
    warranty_info: "वारंटी जानकारी",
    
    // Schemes & Offers
    active_scheme_offer: "सक्रिय स्कीम और ऑफ़र",
    schemes_available: "{count} ऑफ़र उपलब्ध",
    schemes_available_plural: "{count} ऑफ़र्स उपलब्ध",
    reward: "इनाम",
    min_target: "न्यूनतम टारगेट: {count} पीस",
    cart_added: "कार्ट में वर्तमान मात्रा: {count} / {required}",
    offer_unlocked: "ऑफ़र अनलॉक हो गया!",
    add_more_for_offer: "ऑफ़र के लिए {count} और जोड़ें",
    add_more_for_offer_msg: "ऑफ़र पाने के लिए {count} पीस और जोड़ें: {reward}!",
    offer_congrats: "बधाई हो! आप इस ऑर्डर पर {reward} पाने के योग्य हैं",
    min_units_for_offer: "ऑफ़र के लिए न्यूनतम {count} पीस",
    all_schemes_title: "सक्रिय डीलर स्कीमें और थोक छूट",
    all_schemes_subtitle: "विशेष ऑफ़र, अधिक खरीदें मुफ़्त पाएं स्कीमें और गिफ़्ट कॉम्बो",
    view_products: "सामान देखें",
    no_active_schemes: "फ़िलहाल कोई स्कीम सक्रिय नहीं है।",
    active_target_rewards: "सक्रिय टारगेट रिवॉर्ड्स",
    exclusive_deals_title: "विशेष डील्स और ऑफ़र्स",
    exclusive_deals_desc: "सक्रिय थोक स्कीमों के साथ अपना मुनाफ़ा बढ़ाएं।",
    combo_scheme: "कॉम्बो स्कीम",
    eligible_products: "ऑफ़र के सामान",
    add_combo_btn: "⚡ १० जोड़ी कॉम्बो जोड़ें",
    combo_added_alert: "✅ १० जोड़ी कॉम्बो सफलतापूर्वक जोड़ा गया!",
    savings_badge: "बचत: ₹{amount}",
    
    // Cart Screen
    cart_title: "शॉपिंग कार्ट",
    cart_empty: "आपकी कार्ट खाली है",
    go_to_catalog: "कैटलॉग पर जाएं",
    subtotal: "उप-कुल",
    final_amount: "अंतिम कुल राशि",
    net_value: "कुल मूल्य",
    confirm_order: "ऑर्डर कन्फ़र्म करें",
    order_confirmed: "ऑर्डर कन्फ़र्म हो गया!",
    order_remarks_title: "📝 ऑर्डर नोट जोड़ें (वैकल्पिक)",
    order_remarks_placeholder: "कोई विशेष निर्देश या अनुरोध...",
    payment_mode_title: "भुगतान का तरीका चुनें",
    payment_cod: "कैश ऑन डिलीवरी (COD)",
    payment_upi: "फ़ोनपे UPI द्वारा भुगतान",
    payment_daily: "दैनिक कलेक्शन (ऑटो-पे)",
    scan_pay_exact: "स्कैन करें और सही राशि भेजें:",
    upi_no: "UPI नंबर:",
    upload_screenshot: "ऑर्डर पूरा करने के लिए भुगतान का स्क्रीनशॉट अपलोड करें",
    screenshot_ready: "स्क्रीनशॉट अपलोड हो गया",
    need_more_for_reward: "{reward} के लिए {count} और चाहिए",
    free_item: "मुफ़्त सामान",
    combo_applied: "कॉम्बो ऑफ़र लागू हुआ",
    one_rupee_pc: "₹१ / पीस बिलिंग",
    qty_label: "मात्रा",
    clear_cart: "कार्ट खाली करें",
    
    // Help Ticket & Multi-Item Replacement
    help_title: "हेल्प टिकट और रिप्लेसमेंट",
    help_subtitle: "सामान में खराबी, रिप्लेसमेंट या डिलीवरी से जुड़ी सहायता",
    tab_new_ticket: "➕ नया टिकट",
    tab_track_ticket: "📋 टिकट ट्रैक करें",
    select_ticket_type: "टिकट का प्रकार चुनें",
    multi_item_heading: "📦 मल्टी-आइटम रिप्लेसमेंट सूची",
    multi_item_subheading: "एक ही टिकट में सभी खराब या बदले जाने वाले सामान जोड़ें",
    select_brand: "ब्रांड चुनें",
    select_product: "सामान चुनें",
    search_product_barcode: "सामान का नाम या कोड खोजें...",
    defect_type: "समस्या का प्रकार",
    select_defect: "समस्या चुनें",
    quantity: "मात्रा",
    add_item_to_ticket: "➕ सामान टिकट में जोड़ें",
    items_in_ticket: "टिकट में जोड़े गए सामान ({count})",
    no_items_added: "अभी कोई सामान नहीं जोड़ा गया। ऊपर विवरण भरकर सामान जोड़ें बटन दबाएं।",
    remove_item: "हटाएं",
    general_issue_type: "समस्या उप-प्रकार",
    ref_number: "ऑर्डर / बिल नंबर (वैकल्पिक)",
    ref_placeholder: "जैसे ORD-1024 या बिल नंबर",
    ticket_remarks: "समस्या का पूरा विवरण / टिप्पणी",
    ticket_remarks_placeholder: "समस्या का विस्तार से वर्णन करें ताकि हमारी टीम तुरंत हल कर सके...",
    upload_photo: "सामान या बॉक्स का स्पष्ट फ़ोटो प्रमाण अपलोड करें",
    photo_uploaded: "फ़ोटो अपलोड हो गया",
    submit_ticket: "हेल्प टिकट सबमिट करें",
    ticket_history_title: "आपके पुराने हेल्प व रिप्लेसमेंट टिकट",
    no_tickets_found: "अभी तक कोई टिकट दर्ज नहीं किया गया।",
    ticket_status_raised: "दर्ज",
    ticket_status_in_progress: "जांच जारी",
    ticket_status_approved: "स्वीकृत",
    ticket_status_rejected: "अस्वीकृत",
    ticket_status_resolved: "सुलझाया गया",
    ticket_status_actioned: "कार्यवाही हुई",
    ticket_status_label: "स्थिति",
    ticket_id: "टिकट आईडी",
    ticket_date: "तारीख",
    
    // Multi-photo additions
    multi_photo_instruction: "📸 सामान की फ़ोटो (अनिवार्य - कम से कम १ फ़ोटो, एक से अधिक जोड़ सकते हैं)",
    add_more_photos: "+ और फ़ोटो जोड़ें",
    photos_count: "{count} फ़ोटो जोड़ी गईं",
    photo_compulsory_alert: "⚠️ इस सामान के लिए फ़ोटो अपलोड करना अनिवार्य है! कृपया कम से कम १ फ़ोटो जोड़ें।",
    ticket_items_count: "कुल सामान: {count}",
    defect_doa: "शुरू नहीं हो रहा / डेड (DOA)",
    defect_sound: "आवाज़ / स्पीकर की समस्या",
    defect_mic: "माइक / बात करने में समस्या",
    defect_charging: "चार्जिंग / बैटरी की समस्या",
    defect_physical: "टूटा हुआ / डैमेज (ट्रांसपोर्ट में)",
    defect_other: "अन्य तकनीकी खराबी",
    
    cat_replacement: "रिप्लेसमेंट",
    cat_replacement_desc: "खराब या डैमेज सामान की बदली",
    cat_order_delivery: "ऑर्डर और डिलीवरी",
    cat_order_delivery_desc: "डिस्पैच देरी, कम सामान, पार्सल समस्या",
    cat_billing_payment: "बिलिंग और खाताबही",
    cat_billing_payment_desc: "पेमेंट अपडेट नहीं हुआ, बिल सवाल",
    cat_general_support: "सामान्य सहायता",
    cat_general_support_desc: "अकाउंट, स्कीम या अन्य पूछताछ",
    
    // Ledger & Orders
    account_summary: "खाता सारांश",
    outstanding_bal: "बकाया राशि",
    total_bills: "कुल बिल",
    total_paid: "कुल भुगतान",
    outstanding: "बकाया",
    ledger_entries: "खाताबही प्रविष्टियां",
    no_ledger_record: "कोई खाताबही रिकॉर्ड नहीं मिला।",
    download_ledger_pdf: "📥 खाताबही PDF डाउनलोड करें",
    my_past_orders: "मेरे पुराने ऑर्डर्स",
    no_orders_record: "कोई पुराना ऑर्डर नहीं मिला।",
    order_docs: "ऑर्डर दस्तावेज़ और ट्रैकिंग फ़ोटो",
    order_billing_blueprint: "सामान और बिलिंग विवरण",
    payment_label: "भुगतान",
    generating_order_history: "ऑर्डर इतिहास लोड हो रहा है...",
    generating_ledger: "खाताबही विवरण लोड हो रहा है...",
    stock_photo: "स्टॉक फोटो",
    invoice_photo: "बिल / इनवॉइस फोटो",
    box_photo: "बॉक्स फोटो",
    delivery_proof: "डिलीवरी रसीद / POD",
    call_recording: "कॉल रिकॉर्डिंग",
    listen_call: "रिकॉर्डिंग सुनें",
    order_rating: "ऑर्डर रेटिंग",
    payment_proof: "पेमेंट स्क्रीनशॉट",
    secure_viewer: "दस्तावेज़ व्यूअर",
    close_preview: "बंद करने के लिए बाहर कहीं भी टैप करें।",
    open_drive_link: "गूगल ड्राइव में खोलें ↗",
    debit_label: "DR (नामे / बिल हुआ)",
    credit_label: "CR (जमा / भुगतान हुआ)",
    vch_no: "नंबर:"
  },

  mr: {
    // Top Bar & Header
    app_title: "यश मार्केटिंग",
    authorized_portal: "अधिकृत डीलर पोर्टल",
    customer_mode: "ग्राहक",
    dealer_mode: "डीलर",
    logout: "लॉगआउट",
    secure_login: "सुरक्षित लॉगिन",
    enter_10_digit: "१० अंकी मोबाईल नंबर टाका",
    mobile_no_placeholder: "मोबाईल नंबर",
    invalid_number: "अमान्य मोबाईल नंबर",
    select_language: "भाषा निवडा",
    language: "भाषा",
    change_language_instruction: "👉 भाषा बदलण्यासाठी येथे क्लिक करा:",
    
    // Bottom Nav
    nav_home: "मुख्यपृष्ठ",
    nav_offers: "ऑफर्स",
    nav_orders: "ऑर्डर्स",
    nav_ledger: "खातावही",
    nav_help: "मदत तिकीट",
    nav_cart: "कार्ट",
    
    // Catalog / Home Screen
    search_placeholder: "उत्पादने, ब्रँड शोधा...",
    select_category: "वर्ग / कॅटेगरी निवडा",
    all_brands: "सर्व ब्रँड्स",
    all_categories: "सर्व कॅटेगरी",
    sort_high_low: "किंमत: जास्त ते कमी",
    sort_low_high: "किंमत: कमी ते जास्त",
    out_of_stock: "स्टॉकमध्ये नाही",
    item_out_of_stock: "हे उत्पादन सध्या स्टॉकमध्ये उपलब्ध नाही",
    on_order: "ऑर्डरवर",
    on_order_badge: "ऑर्डरवर उपलब्ध",
    on_order_badge_desc: "दुसऱ्या दिवशी मिळेल",
    on_order_desc: "ऑर्डरवर (दुसऱ्या दिवशी मिळेल)",
    new_badge: "नवीन",
    offer_badge: "धमाकेदार ऑफर",
    add_btn: "+ जोडा",
    add_next_day_btn: "+ जोडा (दुसऱ्या दिवशी)",
    add_to_order: "🛒 कार्टमध्ये जोडा",
    add_to_order_next_day: "🛒 कार्टमध्ये जोडा (दुसऱ्या दिवशी)",
    add_to_cart: "🛒 कार्टमध्ये जोडा",
    share_photo: "फोटो शेअर करा",
    share_with_dealer: "डीलरसोबत फोटो शेअर करा",
    contact_us: "संपर्क करा",
    mrp: "एमआरपी",
    off: "सूट",
    view_cart: "कार्ट पहा 🛒",
    total_qty: "एकूण नग",
    syncing_inventory: "स्टॉक माहिती लोड होत आहे...",
    inventory_failed: "स्टॉक माहिती लोड करण्यात अडचण आली",
    force_refresh: "रिफ्रेश करा",
    no_categories: "कोणतीही कॅटेगरी आढळली नाही.",
    no_products_filter: "या फिल्टरनुसार कोणतीही उत्पादने सापडली नाहीत.",
    bulk_tracker: "मोठ्या खरेदीवर सूट ट्रॅकर",
    active_discount: "सक्रिय",
    no_discount: "सूट नाही",
    clear_filters: "फिल्टर काढा",
    
    // Product Detail Modal
    select_variant: "साइज / व्हेरियंट निवडा",
    dealer_price: "डीलर किंमत",
    offer_mrp: "ऑफर एमआरपी",
    in_stock_status: "स्टॉक स्थिती: {count} नग",
    key_highlights: "उत्पादनाची मुख्य वैशिष्ट्ये",
    default_highlights: "कंपनीच्या अधिकृत वॉरंटीसह ओरिजिनल आणि उच्च दर्जाचे उत्पादन. मोठ्या प्रमाणात खरेदीसाठी त्वरित संपर्क साधा.",
    total_selection: "एकूण निवड",
    tap_to_zoom: "फोटो मोठा करण्यासाठी टॅप करा.",
    quick_add_1: "+1 कार्टमध्ये जोडा",
    to_unlock: "ऑफर अनलॉक करण्यासाठी",
    specs: "तपशील",
    brand_label: "ब्रँड",
    category_label: "कॅटेगरी",
    item_code_label: "आयटम कोड",
    warranty_info: "वॉरंटी माहिती",
    
    // Schemes & Offers
    active_scheme_offer: "सक्रिय योजना आणि ऑफर",
    schemes_available: "{count} ऑफर उपलब्ध",
    schemes_available_plural: "{count} ऑफर्स उपलब्ध",
    reward: "बक्षीस / मोफत वस्तू",
    min_target: "किमान टार्गेट: {count} नग",
    cart_added: "सध्या कार्टमध्ये: {count} / {required}",
    offer_unlocked: "अभिनंदन! ऑफर अनलॉक झाली!",
    add_more_for_offer: "ऑफरसाठी आणखी {count} नग जोडा",
    add_more_for_offer_msg: "ऑफर मिळवण्यासाठी आणखी {count} नग जोडा: {reward}!",
    offer_congrats: "अभिनंदन! आपण या ऑर्डरवर {reward} मिळवण्यास पात्र आहात",
    min_units_for_offer: "ऑफरसाठी किमान {count} नग आवश्यक",
    all_schemes_title: "सक्रिय डीलर योजना आणि विशेष सूट",
    all_schemes_subtitle: "खास ऑफर्स, जास्त खरेदी करा मोफत मिळवा योजना आणि गिफ्ट कॉम्बो",
    view_products: "उत्पादने पहा",
    no_active_schemes: "सध्या कोणतीही योजना उपलब्ध नाही.",
    active_target_rewards: "सक्रिय टार्गेट रिवॉर्ड्स",
    exclusive_deals_title: "खास डील्स आणि ऑफर्स",
    exclusive_deals_desc: "सक्रिय होलसेल योजनांसह तुमचा नफा वाढवा.",
    combo_scheme: "कॉम्बो योजना",
    eligible_products: "ऑफरमधील उत्पादने",
    add_combo_btn: "⚡ १० जोड्या कॉम्बो जोडा",
    combo_added_alert: "✅ १० जोड्या कॉम्बो यशस्वीरित्या जोडला!",
    savings_badge: "बचत: ₹{amount}",
    
    // Cart Screen
    cart_title: "शॉपिंग कार्ट",
    cart_empty: "आपली कार्ट रिकामी आहे",
    go_to_catalog: "कॅटलॉगवर जा",
    subtotal: "उप-एकूण",
    final_amount: "अंतिम एकूण रक्कम",
    net_value: "एकूण रक्कम",
    confirm_order: "ऑर्डर निश्चित करा",
    order_confirmed: "ऑर्डर निश्चित झाली!",
    order_remarks_title: "📝 ऑर्डर नोट जोडा (ऐच्छिक)",
    order_remarks_placeholder: "काही विशेष सूचना किंवा विनंती...",
    payment_mode_title: "पेमेंट पद्धत निवडा",
    payment_cod: "कॅश ऑन डिलिव्हरी (COD)",
    payment_upi: "फोनपे UPI द्वारे पेमेंट",
    payment_daily: "दैनिक कलेक्शन (ऑटो-पे)",
    scan_pay_exact: "स्कॅन करून अचूक रक्कम पाठवा:",
    upi_no: "UPI नंबर:",
    upload_screenshot: "ऑर्डर पूर्ण करण्यासाठी पेमेंटचा स्क्रीनशॉट अपलोड करा",
    screenshot_ready: "स्क्रीनशॉट अपलोड झाला आहे",
    need_more_for_reward: "{reward} साठी आणखी {count} नग हवे आहेत",
    free_item: "मोफत वस्तू",
    combo_applied: "कॉम्बो ऑफर लागू झाली",
    one_rupee_pc: "₹१ / नग बिलिंग",
    qty_label: "नग",
    clear_cart: "कार्ट रिकामी करा",
    
    // Help Ticket & Multi-Item Replacement
    help_title: "मदत तिकीट आणि रिप्लेसमेंट",
    help_subtitle: "खराब माल, रिप्लेसमेंट किंवा डिलिव्हरी संबंधित मदत",
    tab_new_ticket: "➕ नवीन तिकीट",
    tab_track_ticket: "📋 तिकीट ट्रॅक करा",
    select_ticket_type: "तिकीट प्रकार निवडा",
    multi_item_heading: "📦 मल्टि-आयटम रिप्लेसमेंट यादी",
    multi_item_subheading: "सर्व खराब किंवा बदलून मिळणाऱ्या वस्तू एकाच तिकिटात जोडा",
    select_brand: "ब्रँड निवडा",
    select_product: "उत्पादन निवडा",
    search_product_barcode: "उत्पादनाचे नाव किंवा कोड शोधा...",
    defect_type: "समस्येचा प्रकार",
    select_defect: "समस्या निवडा",
    quantity: "प्रमाण / नग",
    add_item_to_ticket: "➕ वस्तू तिकिटात जोडा",
    items_in_ticket: "या तिकिटात जोडलेल्या वस्तू ({count})",
    no_items_added: "अजून कोणतीही वस्तू जोडलेली नाही. वरील माहिती भरून वस्तू जोडा बटण दाबा.",
    remove_item: "काढून टाका",
    general_issue_type: "समस्येचा उप-प्रकार",
    ref_number: "ऑर्डर / बिल क्रमांक (ऐच्छिक)",
    ref_placeholder: "उदा. ORD-1024 किंवा बिल नंबर",
    ticket_remarks: "समस्येचा संपूर्ण तपशील / टीप",
    ticket_remarks_placeholder: "समस्येचे सविस्तर वर्णन करा जेणेकरून आमची टीम लवकरात लवकर सोडवू शकेल...",
    upload_photo: "उत्पादन किंवा खोक्याचा स्पष्ट फोटो पुरावा अपलोड करा",
    photo_uploaded: "फोटो अपलोड झाला आहे",
    submit_ticket: "मदत तिकीट पाठवा",
    ticket_history_title: "आपली मागील मदत व रिप्लेसमेंट तिकिटे",
    no_tickets_found: "अजून कोणतेही तिकीट नोंदवले गेले नाही.",
    ticket_status_raised: "दाखल",
    ticket_status_in_progress: "तपासणी सुरू",
    ticket_status_approved: "मंजूर",
    ticket_status_rejected: "नाकारले",
    ticket_status_resolved: "निकाली काढले",
    ticket_status_actioned: "कार्यवाही झाली",
    ticket_status_label: "स्थिती",
    ticket_id: "तिकीट क्रमांक",
    ticket_date: "दिनांक",
    
    // Multi-photo additions
    multi_photo_instruction: "📸 वस्तूचे फोटो (अनिवार्य - किमान १ फोटो, एकापेक्षा जास्त जोडू शकता)",
    add_more_photos: "+ आणखी फोटो जोडा",
    photos_count: "{count} फोटो जोडले",
    photo_compulsory_alert: "⚠️ या उत्पादनासाठी फोटो अपलोड करणे अनिवार्य आहे! कृपया किमान १ फोटो जोडा.",
    ticket_items_count: "एकूण वस्तू: {count}",
    defect_doa: "सुरू होत नाही / डेड (DOA)",
    defect_sound: "आवाज / स्पीकर समस्या",
    defect_mic: "माइक / कॉलिंग समस्या",
    defect_charging: "चार्जिंग / बॅटरी समस्या",
    defect_physical: "तुटलेले / नुकसान (वाहतुकीत)",
    defect_other: "इतर तांत्रिक बिघाड",
    
    cat_replacement: "रिप्लेसमेंट",
    cat_replacement_desc: "दोषी किंवा नुकसान झालेल्या वस्तूची बदली",
    cat_order_delivery: "ऑर्डर आणि डिलिव्हरी",
    cat_order_delivery_desc: "डिस्पॅच उशीर, कमी वस्तू, पॅकेज समस्या",
    cat_billing_payment: "बिलिंग आणि खातावही",
    cat_billing_payment_desc: "पेमेंट दिसले नाही, बिल चौकशी",
    cat_general_support: "सामान्य मदत",
    cat_general_support_desc: "खाते, योजना किंवा इतर विचारणा",
    
    // Ledger & Orders
    account_summary: "खाते सारांश",
    outstanding_bal: "एकूण बाकी रक्कम",
    total_bills: "एकूण बिले",
    total_paid: "एकूण जमा",
    outstanding: "बाकी",
    ledger_entries: "खातावही नोंदी",
    no_ledger_record: "खातावहीत कोणत्याही नोंदी आढळल्या नाहीत.",
    download_ledger_pdf: "📥 खातावही PDF डाउनलोड करा",
    my_past_orders: "माझ्या मागील ऑर्डर्स",
    no_orders_record: "कोणतीही मागील ऑर्डर आढळली नाही.",
    order_docs: "ऑर्डर कागदपत्रे व पडताळणी फोटो",
    order_billing_blueprint: "वस्तू आणि बिलिंग तपशील",
    payment_label: "पेमेंट पद्धत",
    generating_order_history: "ऑर्डर इतिहास लोड होत आहे...",
    generating_ledger: "खातावही स्टेटमेंट लोड होत आहे...",
    stock_photo: "स्टॉक फोटो",
    invoice_photo: "बिल / इनव्हॉइस फोटो",
    box_photo: "खोका / बॉक्स फोटो",
    delivery_proof: "डिलिव्हरी पावती / POD",
    call_recording: "कॉल रेकॉर्डिंग",
    listen_call: "रेकॉर्डिंग ऐका",
    order_rating: "ऑर्डर रेटिंग",
    payment_proof: "पेमेंट स्क्रीनशॉट",
    secure_viewer: "दस्तऐवज व्ह्यूअर",
    close_preview: "बंद करण्यासाठी बाहेर कुठेही टॅप करा.",
    open_drive_link: "गुगल ड्राइव्हमध्ये उघडा ↗",
    debit_label: "DR (नावे / बिल झाले)",
    credit_label: "CR (जमा / पेमेंट झाले)",
    vch_no: "क्रमांक:"
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
    if (text.includes("Buy") && text.includes("Free")) {
      return text.replace(/Buy/gi, 'खरेदी करा').replace(/Get/gi, 'आणि मिळवा').replace(/Free/gi, 'मोफत');
    }
    return text.replace(/Pcs/gi, 'नग').replace(/Free/gi, 'मोफत');
  } else if (lang === 'hi') {
    if (text.includes("Raincoat")) return "हिकविज़न MMC & PD के २५ पीस खरीदें और मुफ़्त रेनकोट पाएं!";
    if (text.includes("VIP Trolley Bag")) return "हिकविज़न MMC & PD के ६० पीस खरीदें और मुफ़्त VIP ट्रॉली बैग (मूल्य ₹९९९९/-) पाएं!";
    if (text.includes("GIFTING COMBO")) return "गिफ्टिंग कॉम्बो - वेलोसिटी नेकबैंड + एयरपॉड्स कॉम्बो मात्र ₹४०० में!";
    if (text.includes("A325") && text.includes("20 Free")) return "बोट केबल A325 - २० पीस खरीदें और २० पीस मुफ़्त पाएं!";
    if (text.includes("A325") && text.includes("75 Free")) return "बोट केबल A325 - ५० पीस खरीदें और ७५ पीस मुफ़्त पाएं!";
    if (text.includes("65w") && text.includes("30 Free")) return "बोट टाइप C to C ६५W केबल - २० पीस खरीदें और ३० पीस A325 केबल मुफ़्त पाएं!";
    if (text.includes("65w") && text.includes("100 Free")) return "बोट टाइप C to C ६५W केबल - ५० पीस खरीदें और १०० पीस A325 केबल मुफ़्त पाएं!";
    if (text.includes("Astra")) return "अस्त्रा ३, अस्त्रा ४, अस्त्रा निओ - १० पीस खरीदें और १ पीस मुफ़्त पाएं!";
    if (text.includes("Summit")) return "समिट, स्ट्राइव, बोल्ड, २६१ प्रो - १० पीस खरीदें और १ पीस मुफ़्त पाएं!";
    if (text.includes("Buy") && text.includes("Free")) {
      return text.replace(/Buy/gi, 'खरीदें').replace(/Get/gi, 'और पाएं').replace(/Free/gi, 'मुफ़्त');
    }
    return text.replace(/Pcs/gi, 'पीस').replace(/Free/gi, 'मुफ़्त');
  }
  return text;
}

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

export function translateCategory(cat, lang = 'en') {
  if (!cat || lang === 'en') return cat;
  const c = String(cat).trim();
  const catMap = {
    // Individual Categories
    'Accessories': { mr: 'अॅक्सेसरीज', hi: 'एक्सेसरीज' },
    'Accessaries': { mr: 'अॅक्सेसरीज', hi: 'एक्सेसरीज' },
    'Airpods': { mr: 'एअरपॉड्स', hi: 'एयरपॉड्स' },
    'Airpodes': { mr: 'एअरपॉड्स', hi: 'एयरपॉड्स' },
    'Airdopes': { mr: 'एअरड्रॉप्स', hi: 'एयरड्रॉप्स' },
    'Airdropes': { mr: 'एअरड्रॉप्स', hi: 'एयरड्रॉप्स' },
    'Earbuds': { mr: 'इअरबड्स', hi: 'इयरबड्स' },
    'Cable': { mr: 'केबल्स', hi: 'केबल्स' },
    'Cables': { mr: 'केबल्स', hi: 'केबल्स' },
    'Data Cable': { mr: 'डेटा केबल', hi: 'डेटा केबल' },
    'Car Accessories': { mr: 'कार अॅक्सेसरीज', hi: 'कार एक्सेसरीज' },
    'Car Charger': { mr: 'कार चार्जर', hi: 'कार चार्जर' },
    'BOAT CAR CHARGER': { mr: 'बोट कार चार्जर', hi: 'बोट कार चार्जर' },
    'Car Stand': { mr: 'कार स्टँड', hi: 'कार स्टैंड' },
    'Charger': { mr: 'चार्जर', hi: 'चार्जर' },
    'Chargers': { mr: 'चार्जर', hi: 'चार्जर' },
    'EMI LOCKER': { mr: 'ईएमआय लॉकर', hi: 'ईएमआई लॉकर' },
    'EMI Locker': { mr: 'ईएमआय लॉकर', hi: 'ईएमआई लॉकर' },
    'Keylock Software': { mr: 'कीलॉक सॉफ्टवेअर', hi: 'कीलॉक सॉफ्टवेयर' },
    'Headphone': { mr: 'हेडफोन', hi: 'हेडफ़ोन' },
    'Headphones': { mr: 'हेडफोन्स', hi: 'हेडफ़ोन' },
    'HEADPHONES': { mr: 'हेडफोन्स', hi: 'हेडफ़ोन' },
    'Home Theater': { mr: 'होम थिएटर', hi: 'होम थिएटर' },
    'Home Theatre': { mr: 'होम थिएटर', hi: 'होम थिएटर' },
    'Keyboard': { mr: 'कीबोर्ड', hi: 'कीबोर्ड' },
    'Mouse': { mr: 'माऊस', hi: 'माउस' },
    'Mouse Pad': { mr: 'माऊस पॅड', hi: 'माउस पैड' },
    'Neckband': { mr: 'नेकबँड', hi: 'नेकबैंड' },
    'NECKBAND': { mr: 'नेकबँड', hi: 'नेकबैंड' },
    'Pendrive': { mr: 'पेनड्राइव्ह', hi: 'पेनड्राइव' },
    'Pandrive': { mr: 'पेनड्राइव्ह', hi: 'पेनड्राइव' },
    'Power Bank': { mr: 'पॉवर बँक', hi: 'पावर बैंक' },
    'Powerbank': { mr: 'पॉवर बँक', hi: 'पावर बैंक' },
    'Power Plate': { mr: 'पॉवर प्लेट', hi: 'पावर प्लेट' },
    'Projector': { mr: 'प्रोजेक्टर', hi: 'प्रोजेक्टर' },
    'Smart Watch': { mr: 'स्मार्ट वॉच', hi: 'स्मार्ट वॉच' },
    'Smart Watches': { mr: 'स्मार्ट वॉचेस', hi: 'स्मार्ट वॉचेस' },
    'Watch': { mr: 'वॉच', hi: 'वॉच' },
    'Speaker': { mr: 'स्पीकर', hi: 'स्पीकर' },
    'Speakers': { mr: 'स्पीकर्स', hi: 'स्पीकर्स' },
    'Usb Hub': { mr: 'यूएसबी हब', hi: 'यूएसबी हब' },
    'Gift Box': { mr: 'गिफ्ट बॉक्स', hi: 'गिफ्ट बॉक्स' },
    'Gift': { mr: 'गिफ्ट', hi: 'गिफ्ट' },
    'HV Gift': { mr: 'हिकव्हिजन गिफ्ट', hi: 'हिकविज़न गिफ्ट' },
    'HV EXTERNAL SSD': { mr: 'हिकव्हिजन एक्सटर्नल एसएसडी', hi: 'हिकविज़न एक्सटर्नल एसएसडी' },
    'HV MEMORY CARD': { mr: 'हिकव्हिजन मेमरी कार्ड', hi: 'हिकविज़न मेमोरी कार्ड' },
    'HV PENDRIVE': { mr: 'हिकव्हिजन पेनड्राइव्ह', hi: 'हिकविज़न पेनड्राइव' },
    'Sandisk Pendrive': { mr: 'सॅनडिस्क पेनड्राइव्ह', hi: 'सैंडिस्क पेनड्राइव' },
    'Sandisk Pandrive': { mr: 'सॅनडिस्क पेनड्राइव्ह', hi: 'सैंडिस्क पेनड्राइव' },
    'Earphone': { mr: 'इयरफोन', hi: 'इयरफ़ोन' },
    'Earphones': { mr: 'इयरफोन्स', hi: 'इयरफ़ोन' },
    'External SSD': { mr: 'एक्सटर्नल एसएसडी', hi: 'एक्सटर्नल एसएसडी' },
    'Memory Card': { mr: 'मेमरी कार्ड', hi: 'मेमोरी कार्ड' },
    'SSD': { mr: 'एसएसडी', hi: 'एसएसडी' },
    'All': { mr: 'सर्व', hi: 'सभी' },

    // Compound Categories (Brand + Type)
    'Boat Airpods': { mr: 'बोट एअरपॉड्स', hi: 'बोट एयरपॉड्स' },
    'Boat Earphone': { mr: 'बोट इयरफोन', hi: 'बोट इयरफ़ोन' },
    'Boat Home Theater': { mr: 'बोट होम थिएटर', hi: 'बोट होम थिएटर' },
    'Boat Neckband': { mr: 'बोट नेकबँड', hi: 'बोट नेकबैंड' },
    'Boat Power Bank': { mr: 'बोट पॉवर बँक', hi: 'बोट पावर बैंक' },
    'Boat Headphone': { mr: 'बोट हेडफोन', hi: 'बोट हेडफ़ोन' },
    'Boat Watch': { mr: 'बोट वॉच', hi: 'बोट वॉच' },
    'Boat Cable': { mr: 'बोट केबल', hi: 'बोट केबल' },
    'Boat Cables': { mr: 'बोट केबल्स', hi: 'बोट केबल्स' },
    'Boat Speakers': { mr: 'बोट स्पीकर्स', hi: 'बोट स्पीकर्स' },
    'Boat Speaker': { mr: 'बोट स्पीकर्स', hi: 'बोट स्पीकर्स' },
    'Boat Charger': { mr: 'बोट चार्जर', hi: 'बोट चार्जर' },
    'Boat Smart Watch': { mr: 'बोट स्मार्ट वॉच', hi: 'बोट स्मार्ट वॉच' },
    'JBL Airpods': { mr: 'जेबीएल एअरपॉड्स', hi: 'जेबीएल एयरपॉड्स' },
    'JBL HEADPHONES': { mr: 'जेबीएल हेडफोन्स', hi: 'जेबीएल हेडफ़ोन' },
    'JBL Home Theatre': { mr: 'जेबीएल होम थिएटर', hi: 'जेबीएल होम थिएटर' },
    'JBL Speaker': { mr: 'जेबीएल स्पीकर', hi: 'जेबीएल स्पीकर' },
    'JBL Speakers': { mr: 'जेबीएल स्पीकर्स', hi: 'जेबीएल स्पीकर्स' },
    'Portronics Car Accessories': { mr: 'पोर्ट्रॉनिक्स कार अॅक्सेसरीज', hi: 'पोर्ट्रॉनिक्स कार एक्सेसरीज' },
    'Portronic Charger': { mr: 'पोर्ट्रॉनिक्स चार्जर', hi: 'पोर्ट्रॉनिक्स चार्जर' },
    'Portronics Charger': { mr: 'पोर्ट्रॉनिक्स चार्जर', hi: 'पोर्ट्रॉनिक्स चार्जर' },
    'Portronics Headphone': { mr: 'पोर्ट्रॉनिक्स हेडफोन', hi: 'पोर्ट्रॉनिक्स हेडफ़ोन' },
    'Portronic Keyboard': { mr: 'पोर्ट्रॉनिक्स कीबोर्ड', hi: 'पोर्ट्रॉनिक्स कीबोर्ड' },
    'Portronic Mouse': { mr: 'पोर्ट्रॉनिक्स माऊस', hi: 'पोर्ट्रॉनिक्स माउस' },
    'Portronic Neckband': { mr: 'पोर्ट्रॉनिक्स नेकबँड', hi: 'पोर्ट्रॉनिक्स नेकबैंड' },
    'Portronic Power Bank': { mr: 'पोर्ट्रॉनिक्स पॉवर बँक', hi: 'पोर्ट्रॉनिक्स पावर बैंक' },
    'Portronics Power Bank': { mr: 'पोर्ट्रॉनिक्स पॉवर बँक', hi: 'पोर्ट्रॉनिक्स पावर बैंक' },
    'Portronic Power Plate': { mr: 'पोर्ट्रॉनिक्स पॉवर प्लेट', hi: 'पोर्ट्रॉनिक्स पावर प्लेट' },
    'Portronic Smart Watch': { mr: 'पोर्ट्रॉनिक्स स्मार्ट वॉच', hi: 'पोर्ट्रॉनिक्स स्मार्ट वॉच' },
    'Portronic Speaker': { mr: 'पोर्ट्रॉनिक्स स्पीकर', hi: 'पोर्ट्रॉनिक्स स्पीकर' },
    'Portronics Accessories': { mr: 'पोर्ट्रॉनिक्स अॅक्सेसरीज', hi: 'पोर्ट्रॉनिक्स एक्सेसरीज' },
    'Portronics Airpods': { mr: 'पोर्ट्रॉनिक्स एअरपॉड्स', hi: 'पोर्ट्रॉनिक्स एयरपॉड्स' },
    'Portronics Cable': { mr: 'पोर्ट्रॉनिक्स केबल', hi: 'पोर्ट्रॉनिक्स केबल' },
    'Portronics Car Charger': { mr: 'पोर्ट्रॉनिक्स कार चार्जर', hi: 'पोर्ट्रॉनिक्स कार चार्जर' },
    'Portronics Car Stand': { mr: 'पोर्ट्रॉनिक्स कार स्टँड', hi: 'पोर्ट्रॉनिक्स कार स्टैंड' },
    'Portronics Earphone': { mr: 'पोर्ट्रॉनिक्स इयरफोन', hi: 'पोर्ट्रॉनिक्स इयरफ़ोन' },
    'Portronics Home Theatre': { mr: 'पोर्ट्रॉनिक्स होम थिएटर', hi: 'पोर्ट्रॉनिक्स होम थिएटर' },
    'Portronics Mouse Pad': { mr: 'पोर्ट्रॉनिक्स माऊस पॅड', hi: 'पोर्ट्रॉनिक्स माउस पैड' },
    'Portronics Projector': { mr: 'पोर्ट्रॉनिक्स प्रोजेक्टर', hi: 'पोर्ट्रॉनिक्स प्रोजेक्टर' },
    'Portronics Usb Hub': { mr: 'पोर्ट्रॉनिक्स यूएसबी हब', hi: 'पोर्ट्रॉनिक्स यूएसबी हब' },
    'Velocity Airpods': { mr: 'व्हेलॉसिटी एअरपॉड्स', hi: 'वेलोसिटी एयरपॉड्स' },
    'Velocity Cable': { mr: 'व्हेलॉसिटी केबल', hi: 'वेलोसिटी केबल' },
    'Velocity Car Charger': { mr: 'व्हेलॉसिटी कार चार्जर', hi: 'वेलोसिटी कार चार्जर' },
    'Velocity Charger': { mr: 'व्हेलॉसिटी चार्जर', hi: 'वेलोसिटी चार्जर' },
    'Velocity Earphone': { mr: 'व्हेलॉसिटी इयरफोन', hi: 'वेलोसिटी इयरफ़ोन' },
    'Velocity Neckband': { mr: 'व्हेलॉसिटी नेकबँड', hi: 'वेलोसिटी नेकबैंड' },
    'Velocity Powerbank': { mr: 'व्हेलॉसिटी पॉवर बँक', hi: 'वेलोसिटी पावर बैंक' },
    'Go Boult Neckband': { mr: 'गो बोल्ट नेकबँड', hi: 'गो बोल्ट नेकबैंड' },
    'Go Boult Airpods': { mr: 'गो बोल्ट एअरपॉड्स', hi: 'गो बोल्ट एयरपॉड्स' },
    'Go Boult Smart Watch': { mr: 'गो बोल्ट स्मार्ट वॉच', hi: 'गो बोल्ट स्मार्ट वॉच' },
    'Go Boult Headphones': { mr: 'गो बोल्ट हेडफोन्स', hi: 'गो बोल्ट हेडफ़ोन' },
    'Go Boult Speaker': { mr: 'गो बोल्ट स्पीकर', hi: 'गो बोल्ट स्पीकर' },
    'Go Boult Powerbank': { mr: 'गो बोल्ट पॉवर बँक', hi: 'गो बोल्ट पावर बैंक' },
    'Saregama Home Theatre': { mr: 'सारेगामा होम थिएटर', hi: 'सारेगामा होम थिएटर' }
  };
  if (catMap[c] && catMap[c][lang]) {
    return catMap[c][lang];
  }
  // Dynamic fallback: translate through product name engine
  return translateProductName(c, lang);
}

export function translateBrand(brand, lang = 'en') {
  if (!brand || lang === 'en') return brand;
  const str = String(brand).trim();
  const brandMap = {
    'Boat': { mr: 'बोट', hi: 'बोट' },
    'boAt': { mr: 'बोट', hi: 'बोट' },
    'BOAT': { mr: 'बोट', hi: 'बोट' },
    'Portronics': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
    'PORTRONICS': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
    'Portronic': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
    'Velocity': { mr: 'व्हेलॉसिटी', hi: 'वेलोसिटी' },
    'Go Boult': { mr: 'गो बोल्ट', hi: 'गो बोल्ट' },
    'GOBOULT': { mr: 'गो बोल्ट', hi: 'गो बोल्ट' },
    'Goboult': { mr: 'गो बोल्ट', hi: 'गो बोल्ट' },
    'Boult': { mr: 'बोल्ट', hi: 'बोल्ट' },
    'JBL': { mr: 'जेबीएल', hi: 'जेबीएल' },
    'Hikvision': { mr: 'हिकव्हिजन', hi: 'हिकविज़न' },
    'HV': { mr: 'हिकव्हिजन', hi: 'हिकविज़न' },
    'Sandisk': { mr: 'सॅनडिस्क', hi: 'सैंडिस्क' },
    'Saregama': { mr: 'सारेगामा', hi: 'सारेगामा' },
    'Carvaan': { mr: 'कारवान', hi: 'कारवान' },
    'Keylock': { mr: 'कीलॉक', hi: 'कीलॉक' },
    'Gift Box': { mr: 'गिफ्ट बॉक्स', hi: 'गिफ्ट बॉक्स' }
  };
  
  if (str.includes(',')) {
    return str.split(',').map(b => {
      const trimmed = b.trim();
      return (brandMap[trimmed] && brandMap[trimmed][lang]) || trimmed;
    }).join(', ');
  }
  return (brandMap[str] && brandMap[str][lang]) || str;
}

export function translateStatus(status, lang = 'en') {
  if (!status || lang === 'en') return status;
  const s = String(status).toLowerCase().trim();
  const statusMap = {
    'pending': { mr: 'प्रलंबित', hi: 'लंबित' },
    'raised': { mr: 'दाखल', hi: 'दर्ज' },
    'inwarded': { mr: 'स्वीकारले', hi: 'स्वीकृत' },
    'in review': { mr: 'तपासणी सुरू', hi: 'समीक्षा जारी' },
    'in progress': { mr: 'प्रक्रिया सुरू', hi: 'प्रक्रिया जारी' },
    'dispatched': { mr: 'पाठवले', hi: 'डिस्पैच' },
    'delivered': { mr: 'पोहोचवले', hi: 'डिलीवर' },
    'approved': { mr: 'मंजूर', hi: 'मंजूर' },
    'approved - credit note raised': { mr: 'मंजूर - क्रेडिट नोट जारी', hi: 'मंजूर - क्रेडिट नोट जारी' },
    'completed': { mr: 'पूर्ण / पोहोचवले', hi: 'पूर्ण / डिलीवर' },
    'complete': { mr: 'पूर्ण / पोहोचवले', hi: 'पूर्ण / डिलीवर' },
    'done': { mr: 'पूर्ण', hi: 'पूर्ण' },
    'processed': { mr: 'प्रक्रिया पूर्ण / पॅकिंग', hi: 'प्रक्रिया पूर्ण / पैकिंग' },
    'processing': { mr: 'प्रक्रिया सुरू', hi: 'प्रक्रिया जारी' },
    'packing': { mr: 'पॅकिंग सुरू', hi: 'पैकिंग जारी' },
    'packed': { mr: 'पॅक केले', hi: 'पैक किया' },
    'billed': { mr: 'बिल तयार', hi: 'बिल तैयार' },
    'ready': { mr: 'तयार', hi: 'तैयार' },
    'in transit': { mr: 'मार्गावर (पाठवले)', hi: 'रास्ते में (डिस्पैच)' },
    'out for delivery': { mr: 'डिलिव्हरीसाठी निघाले', hi: 'डिलीवरी के लिए निकला' },
    'actioned': { mr: 'कार्यवाही झाली', hi: 'कार्यवाही हुई' },
    'resolved': { mr: 'निकाली काढले', hi: 'सुलझाया गया' },
    'rejected': { mr: 'नाकारले', hi: 'अस्वीकृत' },
    'cancelled': { mr: 'रद्द', hi: 'रद्द' }
  };
  return (statusMap[s] && statusMap[s][lang]) || status;
}

export function translatePaymentMode(mode, lang = 'en') {
  if (!mode || lang === 'en') return mode;
  const m = String(mode).toUpperCase().trim();
  const payMap = {
    'COD': { mr: 'कॅश ऑन डिलिव्हरी (COD)', hi: 'कैश ऑन डिलीवरी (COD)' },
    'DAILY': { mr: 'दैनिक (DAILY)', hi: 'दैनिक (DAILY)' },
    'CREDIT': { mr: 'क्रेडिट (उधारी)', hi: 'क्रेडिट (उधारी)' },
    'CHEQUE': { mr: 'चेक (CHEQUE)', hi: 'चेक (CHEQUE)' },
    'ONLINE': { mr: 'ऑनलाइन / UPI', hi: 'ऑनलाइन / UPI' },
    'UPI': { mr: 'यूपीआय (UPI)', hi: 'यूपीआई (UPI)' }
  };
  return (payMap[m] && payMap[m][lang]) || mode;
}

export function translateDefect(defect, lang = 'en') {
  if (!defect || lang === 'en') return defect;
  const d = String(defect).toLowerCase().trim();
  if (d.includes('multi-item') || d.includes('multi item')) {
    const countMatch = d.match(/(d+)s*items?/i);
    const unitsMatch = d.match(/totals*(d+)s*units?/i);
    const itemsCount = countMatch ? countMatch[1] : '';
    const unitsCount = unitsMatch ? unitsMatch[1] : '';
    if (itemsCount && unitsCount) {
      return lang === 'mr' 
        ? `अनेक वस्तू (${itemsCount} प्रकारच्या वस्तू, एकूण ${unitsCount} नग)` 
        : `एकाधिक सामान (${itemsCount} सामान, कुल ${unitsCount} पीस)`;
    }
    return lang === 'mr' ? 'अनेक वस्तू (मल्टी-आयटम)' : 'एकाधिक सामान (मल्टी-आइटम)';
  }
  if (d.includes('dead') || d.includes('doa') || d.includes('start')) {
    return lang === 'mr' ? 'सुरू होत नाही / डेड (DOA)' : 'शुरू नहीं हो रहा / डेड (DOA)';
  }
  if (d.includes('sound') || d.includes('speaker')) {
    return lang === 'mr' ? 'आवाज / स्पीकर समस्या' : 'आवाज़ / स्पीकर की समस्या';
  }
  if (d.includes('mic') || d.includes('calling')) {
    return lang === 'mr' ? 'माइक / कॉलिंग समस्या' : 'माइक / बात करने में समस्या';
  }
  if (d.includes('charg') || d.includes('battery')) {
    return lang === 'mr' ? 'चार्जिंग / बॅटरी समस्या' : 'चार्जिंग / बैटरी की समस्या';
  }
  if (d.includes('physic') || d.includes('damage') || d.includes('broken')) {
    return lang === 'mr' ? 'तुटलेले / नुकसान (वाहतुकीत)' : 'टूटा हुआ / डैमेज (ट्रांसपोर्ट में)';
  }
  if (d.includes('fault') || d.includes('technical')) {
    return lang === 'mr' ? 'इतर तांत्रिक बिघाड' : 'अन्य तकनीकी खराबी';
  }
  return translateProductName(defect, lang);
}

// ==========================================
// COMPREHENSIVE PRODUCT NAME TRANSLATION ENGINE
// ==========================================
const PRODUCT_DICT = {
  // Brands
  'boat': { mr: 'बोट', hi: 'बोट' },
  'portronics': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
  'portronic': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
  'por': { mr: 'पोर्ट्रॉनिक्स', hi: 'पोर्ट्रॉनिक्स' },
  'velocity': { mr: 'व्हेलॉसिटी', hi: 'वेलोसिटी' },
  'goboult': { mr: 'गो बोल्ट', hi: 'गो बोल्ट' },
  'go boult': { mr: 'गो बोल्ट', hi: 'गो बोल्ट' },
  'boult': { mr: 'बोल्ट', hi: 'बोल्ट' },
  'jbl': { mr: 'जेबीएल', hi: 'जेबीएल' },
  'hikvision': { mr: 'हिकव्हिजन', hi: 'हिकविज़न' },
  'hv': { mr: 'हिकव्हिजन', hi: 'हिकविज़न' },
  'sandisk': { mr: 'सॅनडिस्क', hi: 'सैंडिस्क' },
  'saregama': { mr: 'सारेगामा', hi: 'सारेगामा' },
  'carvaan': { mr: 'कारवान', hi: 'कारवान' },
  'keylock': { mr: 'कीलॉक', hi: 'कीलॉक' },

  // Categories & Core Terms
  'airdopes': { mr: 'एअरड्रॉप्स', hi: 'एयरड्रॉप्स' },
  'airdropes': { mr: 'एअरड्रॉप्स', hi: 'एयरड्रॉप्स' },
  'airpods': { mr: 'एअरपॉड्स', hi: 'एयरपॉड्स' },
  'airpodes': { mr: 'एअरपॉड्स', hi: 'एयरपॉड्स' },
  'earbuds': { mr: 'इअरबड्स', hi: 'इयरबड्स' },
  'pods': { mr: 'पॉड्स', hi: 'पॉड्स' },
  'tws': { mr: 'टीडब्ल्यूएस', hi: 'टीडब्ल्यूएस' },
  'rockerz': { mr: 'रॉकर्स', hi: 'रॉकर्स' },
  'bassheads': { mr: 'बासहेड्स', hi: 'बासहेड्स' },
  'aavante': { mr: 'आवांते', hi: 'आवांते' },
  'bar': { mr: 'बार', hi: 'बार' },
  'quake': { mr: 'क्वेक', hi: 'क्वेक' },
  'energyshroom': { mr: 'एनर्जीश्रम', hi: 'एनर्जीश्रम' },
  'power bank': { mr: 'पॉवर बँक', hi: 'पावर बैंक' },
  'powerbank': { mr: 'पॉवर बँक', hi: 'पावर बैंक' },
  'power plate': { mr: 'पॉवर प्लेट', hi: 'पावर प्लेट' },
  'power': { mr: 'पॉवर', hi: 'पावर' },
  'bank': { mr: 'बँक', hi: 'बैंक' },
  'plate': { mr: 'प्लेट', hi: 'प्लेट' },
  'cable': { mr: 'केबल', hi: 'केबल' },
  'cables': { mr: 'केबल्स', hi: 'केबल्स' },
  'charger': { mr: 'चार्जर', hi: 'चार्जर' },
  'chargers': { mr: 'चार्जर', hi: 'चार्जर' },
  'car charger': { mr: 'कार चार्जर', hi: 'कार चार्जर' },
  'car stand': { mr: 'कार स्टँड', hi: 'कार स्टैंड' },
  'car accessories': { mr: 'कार अॅक्सेसरीज', hi: 'कार एक्सेसरीज' },
  'car': { mr: 'कार', hi: 'कार' },
  'accessories': { mr: 'अॅक्सेसरीज', hi: 'एक्सेसरीज' },
  'accessaries': { mr: 'अॅक्सेसरीज', hi: 'एक्सेसरीज' },
  'neckband': { mr: 'नेकबँड', hi: 'नेकबैंड' },
  'smart watch': { mr: 'स्मार्ट वॉच', hi: 'स्मार्ट वॉच' },
  'smart watches': { mr: 'स्मार्ट वॉचेस', hi: 'स्मार्ट वॉचेस' },
  'smart': { mr: 'स्मार्ट', hi: 'स्मार्ट' },
  'watch': { mr: 'वॉच', hi: 'वॉच' },
  'watches': { mr: 'वॉचेस', hi: 'वॉचेस' },
  'speaker': { mr: 'स्पीकर', hi: 'स्पीकर' },
  'speakers': { mr: 'स्पीकर्स', hi: 'स्पीकर्स' },
  'headphone': { mr: 'हेडफोन', hi: 'हेडफ़ोन' },
  'headphones': { mr: 'हेडफोन्स', hi: 'हेडफ़ोन' },
  'earphone': { mr: 'इयरफोन', hi: 'इयरफ़ोन' },
  'earphones': { mr: 'इयरफोन्स', hi: 'इयरफ़ोन' },
  'mouse pad': { mr: 'माऊस पॅड', hi: 'माउस पैड' },
  'mouse': { mr: 'माऊस', hi: 'माउस' },
  'pad': { mr: 'पॅड', hi: 'पैड' },
  'keyboard': { mr: 'कीबोर्ड', hi: 'कीबोर्ड' },
  'projector': { mr: 'प्रोजेक्टर', hi: 'प्रोजेक्टर' },
  'usb hub': { mr: 'यूएसबी हब', hi: 'यूएसबी हब' },
  'hub': { mr: 'हब', hi: 'हब' },
  'memory card': { mr: 'मेमरी कार्ड', hi: 'मेमोरी कार्ड' },
  'memory': { mr: 'मेमरी', hi: 'मेमोरी' },
  'card': { mr: 'कार्ड', hi: 'कार्ड' },
  'pendrive': { mr: 'पेनड्राइव्ह', hi: 'पेनड्राइव' },
  'pandrive': { mr: 'पेनड्राइव्ह', hi: 'पेनड्राइव' },
  'external ssd': { mr: 'एक्सटर्नल एसएसडी', hi: 'एक्सटर्नल एसएसडी' },
  'external': { mr: 'एक्सटर्नल', hi: 'एक्सटर्नल' },
  'ssd': { mr: 'एसएसडी', hi: 'एसएसडी' },
  'software': { mr: 'सॉफ्टवेअर', hi: 'सॉफ्टवेयर' },
  'emi locker': { mr: 'ईएमआय लॉकर', hi: 'ईएमआई लॉकर' },
  'locker': { mr: 'लॉकर', hi: 'लॉकर' },
  'emi': { mr: 'ईएमआय', hi: 'ईएमआई' },
  'home theater': { mr: 'होम थिएटर', hi: 'होम थिएटर' },
  'home theatre': { mr: 'होम थिएटर', hi: 'होम थिएटर' },
  'theater': { mr: 'थिएटर', hi: 'थिएटर' },
  'theatre': { mr: 'थिएटर', hi: 'थिएटर' },
  'gift box': { mr: 'गिफ्ट बॉक्स', hi: 'गिफ्ट बॉक्स' },
  'gift': { mr: 'गिफ्ट', hi: 'गिफ्ट' },
  'box': { mr: 'बॉक्स', hi: 'बॉक्स' },

  // Models & Series
  'tune': { mr: 'ट्यून', hi: 'ट्यून' },
  'beam': { mr: 'बीम', hi: 'बीम' },
  'mustang': { mr: 'मस्टँग', hi: 'मस्टैंग' },
  'sprint': { mr: 'स्प्रिंट', hi: 'स्प्रिंट' },
  'turbo': { mr: 'टर्बो', hi: 'टर्बो' },
  'tenet': { mr: 'टेनेट', hi: 'टेनेट' },
  'midnight': { mr: 'मिडनाइट', hi: 'मिडनाइट' },
  'elite': { mr: 'एलिट', hi: 'एलिट' },
  'anc': { mr: 'एएनसी', hi: 'एएनसी' },
  'hurricane': { mr: 'हरिकेन', hi: 'हरिकेन' },
  'clip': { mr: 'क्लिप', hi: 'क्लिप' },
  'noir': { mr: 'नॉइर', hi: 'नॉइर' },
  'active': { mr: 'अॅक्टिव्ह', hi: 'एक्टिव' },
  'ember': { mr: 'एम्बर', hi: 'एम्बर' },
  'raven': { mr: 'रेव्हन', hi: 'रेवन' },
  'fcharg': { mr: 'एफचार्ज', hi: 'एफचार्ज' },
  'superfast': { mr: 'सुपरफास्ट', hi: 'सुपरफास्ट' },
  'braided': { mr: 'ब्रेडेड', hi: 'ब्रेडेड' },
  'silver plus': { mr: 'सिल्व्हर प्लस', hi: 'सिल्वर प्लस' },
  'silver': { mr: 'सिल्व्हर', hi: 'सिल्वर' },
  'gold': { mr: 'गोल्ड', hi: 'गोल्ड' },
  'diamond': { mr: 'डायमंड', hi: 'डायमंड' },
  'plus': { mr: 'प्लस', hi: 'प्लस' },
  'pro': { mr: 'प्रो', hi: 'प्रो' },
  'max': { mr: 'मॅक्स', hi: 'मैक्स' },
  'ultra': { mr: 'अल्ट्रा', hi: 'अल्ट्रा' },
  'prime': { mr: 'प्राइम', hi: 'प्राइम' },
  'loop': { mr: 'लूप', hi: 'लूप' },
  'pearl': { mr: 'पर्ल', hi: 'पर्ल' },
  'jade': { mr: 'जेड', hi: 'जेड' },
  'pebble': { mr: 'पेबल', hi: 'पेबल' },
  'onyx': { mr: 'ऑनिक्स', hi: 'ऑनिक्स' },
  'bold': { mr: 'बोल्ड', hi: 'बोल्ड' },
  'trinity': { mr: 'ट्रिनिटी', hi: 'ट्रिनिटी' },
  'grande': { mr: 'ग्रँडे', hi: 'ग्रैंड' },
  'summit': { mr: 'समिट', hi: 'समिट' },
  'lunar': { mr: 'लुनार', hi: 'लुनार' },
  'orbit': { mr: 'ऑर्बिट', hi: 'ऑर्बिट' },
  'wave': { mr: 'वेव्ह', hi: 'वेव' },
  'twins': { mr: 'ट्विन्स', hi: 'ट्विन्स' },
  'harmonics': { mr: 'हार्मोनिक्स', hi: 'हार्मोनिक्स' },
  'luxcell': { mr: 'लक्सेल', hi: 'लक्सेल' },
  'konnect': { mr: 'कनेक्ट', hi: 'कनेक्ट' },
  'adapto': { mr: 'अडॅप्टो', hi: 'अडैप्टो' },
  'adaptor': { mr: 'अडॅप्टर', hi: 'अडैप्टर' },
  'carbon': { mr: 'कार्बन', hi: 'कार्बन' },
  'immortal': { mr: 'इमॉर्टल', hi: 'इमॉर्टल' },
  'storm': { mr: 'स्टॉर्म', hi: 'स्टॉर्म' },
  'strom': { mr: 'स्टॉर्म', hi: 'स्टॉर्म' },
  'toad': { mr: 'टोड', hi: 'टोड' },
  'holder': { mr: 'होल्डर', hi: 'होल्डर' },
  'stand': { mr: 'स्टँड', hi: 'स्टैंड' },
  'conch': { mr: 'कॉन्च', hi: 'कॉन्च' },
  'cherry blossom': { mr: 'चेरी ब्लॉसम', hi: 'चेरी ब्लॉसम' },
  'cherry': { mr: 'चेरी', hi: 'चेरी' },
  'blossom': { mr: 'ब्लॉसम', hi: 'ब्लॉसम' },
  'wired': { mr: 'वायर्ड', hi: 'वायर्ड' },
  'wireless': { mr: 'वायरलेस', hi: 'वायरलेस' },
  'bluetooth': { mr: 'ब्लूटूथ', hi: 'ब्लूटूथ' },
  'premium': { mr: 'प्रीमियम', hi: 'प्रीमियम' },
  'classic': { mr: 'क्लासिक', hi: 'क्लासिक' },
  'gen 2': { mr: 'जनरेशन २', hi: 'जनरेशन २' },
  'gen2': { mr: 'जनरेशन २', hi: 'जनरेशन २' },
  'gen': { mr: 'जनरेशन', hi: 'जनरेशन' },
  'nirvana': { mr: 'निर्वाणा', hi: 'निर्वाणा' },
  'vayu': { mr: 'वायू', hi: 'वायु' },
  'dash': { mr: 'डॅश', hi: 'डैश' },
  'partypal': { mr: 'पार्टीपॉल', hi: 'पार्टीपॉल' },
  'stone': { mr: 'स्टोन', hi: 'स्टोन' },
  'soundbar': { mr: 'साउंडबार', hi: 'साउंडबार' },
  'dynamite': { mr: 'डायनामाइट', hi: 'डायनामाइट' },
  'blitz': { mr: 'ब्लिट्झ', hi: 'ब्लिट्झ' },
  'bounce': { mr: 'बाउन्स', hi: 'बाउन्स' },
  'beats': { mr: 'बीट्स', hi: 'बीट्स' },
  'cruiser': { mr: 'क्रूझर', hi: 'क्रूज़र' },
  'pulse': { mr: 'पल्स', hi: 'पल्स' },
  'echo': { mr: 'इको', hi: 'इको' },
  'flex': { mr: 'फ्लेक्स', hi: 'फ्लेक्स' },
  'speed': { mr: 'स्पीड', hi: 'स्पीड' },
  'rapid': { mr: 'रॅपिड', hi: 'रैपिड' },
  'spark': { mr: 'स्पार्क', hi: 'स्पार्क' },
  'blaze': { mr: 'ब्लेझ', hi: 'ब्लेज़' },
  'touch': { mr: 'टच', hi: 'टच' },
  'true': { mr: 'ट्रू', hi: 'ट्रू' },
  'play': { mr: 'प्ले', hi: 'प्ले' },
  'sense': { mr: 'सेन्स', hi: 'सेन्स' },
  'shield': { mr: 'शील्ड', hi: 'शील्ड' },
  'armor': { mr: 'आर्मर', hi: 'आर्मर' },
  'focus': { mr: 'फोकस', hi: 'फोकस' },
  'extreme': { mr: 'एक्सट्रीम', hi: 'एक्सट्रीम' },
  'pure': { mr: 'प्युअर', hi: 'प्योर' },
  'bass': { mr: 'बास', hi: 'बास' },
  'rhythm': { mr: 'रिदम', hi: 'रिदम' },
  'ranger': { mr: 'रेंजर', hi: 'रेंजर' },
  'thunder': { mr: 'थंडर', hi: 'थंडर' },
  'sonic': { mr: 'सॉनिक', hi: 'सॉनिक' },
  'clarity': { mr: 'क्लॅरिटी', hi: 'क्लैरिटी' },
  'vibe': { mr: 'व्हाइब', hi: 'वाइब' },
  'connect': { mr: 'कनेक्ट', hi: 'कनेक्ट' },
  'switch': { mr: 'स्विच', hi: 'स्विच' },
  'neo': { mr: 'निओ', hi: 'निओ' },
  'air': { mr: 'एअर', hi: 'एयर' },
  'go': { mr: 'गो', hi: 'गो' },
  'original': { mr: 'ओरिजिनल', hi: 'ओरिजिनल' },
  'astra': { mr: 'अस्त्रा', hi: 'अस्त्रा' },
  'strive': { mr: 'स्ट्राइव्ह', hi: 'स्ट्राइव' },
  'alpha': { mr: 'अल्फा', hi: 'अल्फा' },
  'omega': { mr: 'ओमेगा', hi: 'ओमेगा' },
  'delta': { mr: 'डेल्टा', hi: 'डेल्टा' },
  'titan': { mr: 'टायटन', hi: 'टाइटन' },
  'edge': { mr: 'एज', hi: 'एज' },
  'flare': { mr: 'फ्लेअर', hi: 'फ्लेयर' },
  'blast': { mr: 'ब्लास्ट', hi: 'ब्लास्ट' },
  'glide': { mr: 'ग्लाइड', hi: 'ग्लाइड' },
  'shift': { mr: 'शिफ्ट', hi: 'शिफ्ट' },
  'flow': { mr: 'फ्लो', hi: 'फ्लो' },
  'breeze': { mr: 'ब्रीझ', hi: 'ब्रीज़' },
  'zenith': { mr: 'झेनिथ', hi: 'झेनिथ' },
  'phantom': { mr: 'फँटम', hi: 'फैंटम' },

  // Technical & Connectors
  'type c to c': { mr: 'टाइप सी ते सी', hi: 'टाइप सी से सी' },
  'c to c': { mr: 'टाइप सी ते सी', hi: 'टाइप सी से सी' },
  'type c': { mr: 'टाइप सी', hi: 'टाइप सी' },
  'micro usb': { mr: 'मायक्रो यूएसबी', hi: 'माइक्रो यूएसबी' },
  'lightning': { mr: 'लाइटनिंग', hi: 'लाइटनिंग' },
  'usb': { mr: 'यूएसबी', hi: 'यूएसबी' },
  'micro': { mr: 'मायक्रो', hi: 'माइक्रो' },
  'fast charging': { mr: 'फास्ट चार्जिंग', hi: 'फ़ास्ट चार्जिंग' },
  'fast': { mr: 'फास्ट', hi: 'फ़ास्ट' },
  'charging': { mr: 'चार्जिंग', hi: 'चार्जिंग' },
  '4 in 1': { mr: '४ इन १', hi: '४ इन १' },
  '3 in 1': { mr: '३ इन १', hi: '३ इन १' },
  '2 in 1': { mr: '२ इन १', hi: '२ इन १' },
  '120w': { mr: '१२०W', hi: '१२०W' },
  '65w': { mr: '६५W', hi: '६५W' },
  '35w': { mr: '३५W', hi: '३५W' },
  '20w': { mr: '२०W', hi: '२०W' },

  // Colors
  'black': { mr: 'काळा', hi: 'काला' },
  'white': { mr: 'पांढरा', hi: 'सफ़ेद' },
  'blue': { mr: 'निळा', hi: 'नीला' },
  'red': { mr: 'लाल', hi: 'लाल' },
  'green': { mr: 'हिरवा', hi: 'हरा' },
  'grey': { mr: 'राखाडी', hi: 'ग्रे' },
  'gray': { mr: 'राखाडी', hi: 'ग्रे' },
  'yellow': { mr: 'पिवळा', hi: 'पीला' },
  'orange': { mr: 'नारिंगी', hi: 'नारंगी' },
  'pink': { mr: 'गुलाबी', hi: 'गुलाबी' },
  'purple': { mr: 'जांभळा', hi: 'बैंगनी' },
  'ivory': { mr: 'आयव्हरी', hi: 'आइवरी' },
  'metallic': { mr: 'मेटॅलिक', hi: 'मेटैलिक' },

  // Order history / Ledger / Defect phrases
  'upi discount': { mr: 'यूपीआय डिस्काउंट', hi: 'यूपीआई डिस्काउंट' },
  'bulk discount': { mr: 'बल्क डिस्काउंट', hi: 'बल्क डिस्काउंट' },
  'discount': { mr: 'डिस्काउंट', hi: 'छूट' },
  'reward': { mr: 'रिवॉर्ड / बक्षीस', hi: 'रिवॉर्ड / इनाम' },
  'free': { mr: 'मोफत', hi: 'मुफ़्त' },
  'charging / battery problem': { mr: 'चार्जिंग / बॅटरी समस्या', hi: 'चार्जिंग / बैटरी की समस्या' },
  'battery problem': { mr: 'बॅटरी समस्या', hi: 'बैटरी की समस्या' },
  'mic / calling problem': { mr: 'माइक / कॉलिंग समस्या', hi: 'माइक / बात करने में समस्या' },
  'sound / speaker issue': { mr: 'आवाज / स्पीकर समस्या', hi: 'आवाज़ / स्पीकर की समस्या' },
  'other technical fault': { mr: 'इतर तांत्रिक बिघाड', hi: 'अन्य तकनीकी खराबी' },
  'dead on arrival (doa)': { mr: 'सुरू होत नाही / डेड (DOA)', hi: 'शुरू नहीं हो रहा / डेड (DOA)' },
  'dead on arrival': { mr: 'सुरू होत नाही / डेड (DOA)', hi: 'शुरू नहीं हो रहा / डेड (DOA)' },
  'multi-item': { mr: 'अनेक वस्तू (मल्टी-आयटम)', hi: 'एकाधिक सामान (मल्टी-आइटम)' },
  'multi item': { mr: 'अनेक वस्तू (मल्टी-आयटम)', hi: 'एकाधिक सामान (मल्टी-आइटम)' },
  'photos': { mr: 'फोटो', hi: 'फ़ोटो' },
  'photo': { mr: 'फोटो', hi: 'फ़ोटो' },
  'items': { mr: 'वस्तू', hi: 'सामान' },
  'item': { mr: 'वस्तू', hi: 'सामान' },
  'units': { mr: 'नग', hi: 'पीस' },
  'unit': { mr: 'नग', hi: 'पीस' },
  'pcs': { mr: 'नग', hi: 'पीस' },
  'pc': { mr: 'नग', hi: 'पीस' },
  'total': { mr: 'एकूण', hi: 'कुल' },
  'defect / issue type': { mr: 'तक्रार प्रकार', hi: 'शिकायत प्रकार' },
  'defect type': { mr: 'तक्रार प्रकार', hi: 'शिकायत प्रकार' }
};

const SORTED_PRODUCT_KEYS = Object.keys(PRODUCT_DICT).sort((a,b) => b.length - a.length);

function escapeRegex(string) {
  return string.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&');
}

export function translateProductName(name, lang = 'en') {
  if (!name || lang === 'en') return name;
  let text = String(name);

  // 1. Dictionary-based phrase and token replacement (longest matches first)
  SORTED_PRODUCT_KEYS.forEach(k => {
    const val = PRODUCT_DICT[k][lang] || PRODUCT_DICT[k]['mr'];
    const escaped = escapeRegex(k);
    const regex = new RegExp('(^|[^a-zA-Z0-9_])' + escaped + '(?=[^a-zA-Z0-9_]|$)', 'gi');
    text = text.replace(regex, (match, prefix) => prefix + val);
  });

  // 2. Phonetic transliteration fallback for any remaining English Latin words
  text = text.replace(/\b[a-zA-Z]+\b/g, (word) => {
    // Keep units or standard acronyms intact if desired, or transliterate
    const w = word.toLowerCase();
    if (w === 'x' || w === 'gb' || w === 'mah' || w === 'w') {
      return word;
    }
    // Simple phonetic conversion
    let res = w;
    res = res.replace(/sh/g, 'श')
             .replace(/ch/g, 'च')
             .replace(/th/g, 'थ')
             .replace(/ph/g, 'फ')
             .replace(/kh/g, 'ख')
             .replace(/gh/g, 'घ')
             .replace(/bh/g, 'भ')
             .replace(/dh/g, 'ध')
             .replace(/jh/g, 'झ')
             .replace(/ee/g, 'ी')
             .replace(/oo/g, 'ू')
             .replace(/ai/g, 'ऐ')
             .replace(/au/g, 'औ')
             .replace(/ou/g, 'आउ')
             .replace(/ea/g, 'ी')
             .replace(/oa/g, 'ो')
             .replace(/a/g, 'ा')
             .replace(/e/g, 'े')
             .replace(/i/g, 'ि')
             .replace(/o/g, 'ो')
             .replace(/u/g, 'ु')
             .replace(/b/g, 'ब')
             .replace(/c/g, 'क')
             .replace(/d/g, 'ड')
             .replace(/f/g, 'फ')
             .replace(/g/g, 'ग')
             .replace(/h/g, 'ह')
             .replace(/j/g, 'ज')
             .replace(/k/g, 'क')
             .replace(/l/g, 'ल')
             .replace(/m/g, 'म')
             .replace(/n/g, 'न')
             .replace(/p/g, 'प')
             .replace(/q/g, 'क')
             .replace(/r/g, 'र')
             .replace(/s/g, 'स')
             .replace(/t/g, 'ट')
             .replace(/v/g, 'व्ह')
             .replace(/w/g, 'व')
             .replace(/x/g, 'क्स')
             .replace(/y/g, 'य')
             .replace(/z/g, 'झ');
    return res;
  });

  return text;
}
