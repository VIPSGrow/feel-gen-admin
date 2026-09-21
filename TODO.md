# SignUpStepForm - GST Validation Task

## Steps
- [x] Read and understand SignUpStepForm.tsx, serverCallFunction/constantFunction, signup page
- [x] Add GST state variables (isCheckingGST, gstExists, gstCheckResponse)
- [x] Add checkGST function calling `api/users/checkGST/:gst_no`
- [x] Add debounced GST availability check effect (step 5, 15-char GSTIN)
- [x] Add GST validation in isStepValid() for step 5
- [x] Add inline UI feedback (checking/available message) on GSTIN input
- [x] Clear GST error/exists state while editing GSTIN
- [x] Verify build compiles
