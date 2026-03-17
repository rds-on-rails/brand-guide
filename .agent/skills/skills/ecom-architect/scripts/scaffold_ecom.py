import os
import sys

def create_structure(base_dir):
    structure = [
        "components/ProductGallery.tsx",
        "components/ProductDetail.tsx",
        "components/ShoppingCart.tsx",
        "components/CheckoutFlow.tsx",
        "components/OrderTrackingStepper.tsx",
        "components/AuthModal.tsx",
        "components/AdminSidebar.tsx",
        "pages/index.tsx",
        "pages/auth/login.tsx",
        "pages/auth/signup.tsx",
        "pages/admin/dashboard.tsx",
        "pages/products/[id].tsx",
        "pages/checkout.tsx",
        "pages/orders.tsx",
        "pages/api/track-order.ts",
        "store/orderMachine.ts", # For XState or Redux
        "store/authSlice.ts",
        "styles/globals.css",
        "tailwind.config.js"
    ]
    
    for path in structure:
        full_path = os.path.join(base_dir, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(f"// Boilerplate for {os.path.basename(path)}\n")
            
    print(f"Scaffolded e-commerce structure in {base_dir}")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "./ecom-store"
    create_structure(target_dir)
