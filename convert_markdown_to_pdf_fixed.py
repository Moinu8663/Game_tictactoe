from fpdf import FPDF
import os

class PDF(FPDF):
    pass


def render_markdown(pdf, md_file):
    with open(md_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    for raw in lines:
        line = raw.rstrip('\n')
        if not line.strip():
            pdf.ln(4)
            continue

        if line.startswith('# '):
            pdf.set_font('Arial', 'B', 18)
            pdf.multi_cell(0, 9, line[2:].strip())
            pdf.ln(2)
        elif line.startswith('## '):
            pdf.set_font('Arial', 'B', 16)
            pdf.multi_cell(0, 8, line[3:].strip())
            pdf.ln(2)
        elif line.startswith('### '):
            pdf.set_font('Arial', 'B', 14)
            pdf.multi_cell(0, 8, line[4:].strip())
            pdf.ln(2)
        elif line.startswith('- '):
            pdf.set_font('Arial', '', 12)
            pdf.multi_cell(0, 7, '- ' + line[2:].strip())
        elif line.startswith('|'):
            pdf.set_font('Arial', '', 11)
            pdf.multi_cell(0, 7, line.strip())
        else:
            pdf.set_font('Arial', '', 12)
            pdf.multi_cell(0, 7, line.strip())


def main():
    md_file = os.path.join(os.path.dirname(__file__), 'PROJECT_DOCUMENTATION.md')
    pdf_file = os.path.join(os.path.dirname(__file__), 'TicTacToe_Arena_Documentation.pdf')

    pdf = PDF()
    render_markdown(pdf, md_file)
    pdf.output(pdf_file)
    print(f'Generated {pdf_file}')


if __name__ == '__main__':
    main()
