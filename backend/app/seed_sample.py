import asyncio
from pathlib import Path
import fitz  # PyMuPDF
from app.core.database import SessionLocal, init_db
from app.repositories.repository import repo
from app.services.storage_service import storage_service
from app.workers.processor import process_document_pipeline

def generate_sample_pdf(output_path: Path):
    doc = fitz.open()

    # Page 1: Introduction & Foundational Definitions
    page1 = doc.new_page()
    text_p1 = """Chapter 4: Photosynthesis and Cellular Energetics

1. Foundations of Biological Energy Conversion
Photosynthesis is defined as the biological process by which autotrophic organisms convert solar light energy into stable chemical energy stored in glucose molecules. This energy-trapping mechanism forms the primary thermodynamic foundation for almost all biospheric life on Earth.

Key Terminology:
- Chloroplast: The specialized double-membrane organelle inside plant cells where the photosynthesis reactions occur.
- Chlorophyll: The principal green photosynthetic pigment located inside the thylakoid membrane that absorbs blue and red wavelengths of light while reflecting green.
- Photolysis: The process of splitting water molecules using light photons, yielding oxygen gas, protons, and free electrons.

Overview of Stages:
The complete photosynthetic reaction consists of two mutually dependent metabolic phases:
1. The Light-Dependent Reactions (occurring in the thylakoid membranes).
2. The Light-Independent Calvin Cycle (occurring in the stroma matrix)."""
    page1.insert_text((50, 60), text_p1, fontsize=11, fontname="helv")

    # Page 2: Mechanism of Action & Electron Transport
    page2 = doc.new_page()
    text_p2 = """2. The Light-Dependent Reactions: Mechanism of Action

The Light-Dependent phase initiates when light photons strike Photosystem II (PSII). The absorbed energy excites electrons to a higher orbital energy state.

Sequential Execution Steps:
Step 1: Photon absorption occurs at the light-harvesting antenna complex of Photosystem II.
Step 2: Water photolysis replenishes the lost electrons, generating oxygen as a byproduct.
Step 3: Excited electrons traverse the electron transport chain (Plastoquinone, Cytochrome b6f complex, and Plastocyanin).
Step 4: Proton pumping creates an electrochemical proton gradient across the thylakoid membrane.
Step 5: ATP Synthase utilizes the proton-motive force to synthesize ATP from ADP and inorganic phosphate.
Step 6: Photosystem I re-energizes electrons to reduce NADP+ into NADPH.

Validation Criteria:
If water molecules are unavailable, electron transport halts due to electron carrier starvation. If light intensity falls below the minimum compensation threshold, ATP generation ceases."""
    page2.insert_text((50, 60), text_p2, fontsize=11, fontname="helv")

    # Page 3: The Calvin Cycle & Chemical Synthesis
    page3 = doc.new_page()
    text_p3 = """3. The Calvin Cycle: Synthesis of Hexose Sugars

The Calvin Cycle occurs in the chloroplast stroma and does not directly require photons, but relies strictly on the ATP and NADPH produced during the light reactions.

Three Main Phases:
Phase 1: Carbon Fixation. The enzyme RuBisCO catalyzes the carboxylation of ribulose-1,5-bisphosphate (RuBP) by gaseous carbon dioxide, producing unstable 6-carbon intermediates that split into 3-PGA.
Phase 2: Reduction. ATP and NADPH phosphorylate and reduce 3-PGA into glyceraldehyde-3-phosphate (G3P).
Phase 3: Regeneration of RuBP. For every six turns of the cycle, two G3P molecules exit to form glucose, while ten G3P molecules are rearranged into RuBP using additional ATP.

Governing Principles and Summary:
- RuBisCO is defined as the most abundant enzyme on Earth and the rate-limiting catalyst of carbon fixation.
- Efficiency depends heavily on ambient CO2 concentration, temperature, and stomatal conductance."""
    page3.insert_text((50, 60), text_p3, fontsize=11, fontname="helv")

    doc.save(str(output_path))
    doc.close()

async def main():
    init_db()
    db = SessionLocal()

    user_id = "demo-student-001"
    repo.get_or_create_profile(db, user_id, "student@visuallearn.ai", "Demo Student")

    # Check if sample doc already seeded
    existing = repo.get_user_documents(db, user_id, search="Photosynthesis")
    if existing:
        print(f"Sample document already exists: {existing[0].id}")
        db.close()
        return

    sample_pdf_path = Path("sample_photosynthesis.pdf")
    generate_sample_pdf(sample_pdf_path)

    with open(sample_pdf_path, "rb") as f:
        content = f.read()

    storage_path = storage_service.save_file(user_id, "Photosynthesis_and_Cellular_Energetics.pdf", content)
    doc = repo.create_document(
        db,
        user_id=user_id,
        title="Chapter 4: Photosynthesis & Cellular Energetics",
        subject="Biology & Medicine",
        storage_path=storage_path,
        file_size=len(content)
    )
    db.close()

    print(f"Processing seeded document: {doc.id}...")
    await process_document_pipeline(doc.id)
    print("Sample document processed and all visual lessons generated successfully!")

    if sample_pdf_path.exists():
        sample_pdf_path.unlink()

if __name__ == "__main__":
    asyncio.run(main())
