import pytest
from app.services.ai_service import ai_service

@pytest.mark.asyncio
async def test_ai_provider_info():
    info = ai_service.get_provider_info()
    assert "active_provider" in info
    assert "mode_label" in info
    assert "has_api_key" in info

@pytest.mark.asyncio
async def test_generate_visual_summary():
    pages = [
        {"page": 1, "text": "Photosynthesis is defined as the process by which green plants transform light energy into chemical energy."},
        {"page": 2, "text": "Chloroplasts contain chlorophyll which absorbs light wavelengths during the reaction."}
    ]
    summary = await ai_service.generate_visual_summary("Photosynthesis", "Photosynthesis is the process...", pages)
    assert summary.title == "Photosynthesis"
    assert len(summary.key_concepts) > 0
    assert len(summary.key_takeaways) > 0

@pytest.mark.asyncio
async def test_generate_mindmap():
    pages = [{"page": 1, "text": "Photosynthesis involves light-dependent reactions and light-independent Calvin cycle."}]
    mindmap = await ai_service.generate_mindmap("Biology", "Photosynthesis text...", pages)
    assert len(mindmap.nodes) >= 3
    assert len(mindmap.edges) >= 2
    root_node = next(n for n in mindmap.nodes if n.id == "root")
    assert root_node is not None

@pytest.mark.asyncio
async def test_generate_flowchart():
    pages = [{"page": 1, "text": "Step 1: Input photon absorption. Step 2: Electron transport chain. Step 3: ATP production."}]
    flowchart = await ai_service.generate_flowchart("Cellular Respiration", "Steps...", pages)
    assert len(flowchart.steps) >= 3
    assert flowchart.steps[0].step_type == "start"

@pytest.mark.asyncio
async def test_generate_quiz():
    pages = [
        {"page": 1, "text": "Mitochondria is defined as the powerhouse of the cell responsible for generating ATP energy."}
    ]
    quiz = await ai_service.generate_quiz("Cell Biology", "Mitochondria...", pages)
    assert len(quiz.questions) > 0
    assert len(quiz.questions[0].options) == 4
    assert 0 <= quiz.questions[0].correct_answer_index <= 3
