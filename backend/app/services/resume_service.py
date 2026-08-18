
from pathlib import Path
from tempfile import NamedTemporaryFile

from markitdown import MarkItDown


def convert_resume_to_markdown(
    file_bytes: bytes,
    filename: str,
) -> str:
    suffix = Path(filename).suffix.lower()

    if suffix != ".pdf":
        raise ValueError(
            "Only PDF resumes are supported."
        )

    with NamedTemporaryFile(
        suffix=".pdf",
        delete=False,
    ) as temp_file:
        temp_file.write(file_bytes)
        temp_path = temp_file.name

    try:
        converter = MarkItDown()

        result = converter.convert(temp_path)

        return result.markdown

    finally:
        Path(temp_path).unlink(
            missing_ok=True
        )