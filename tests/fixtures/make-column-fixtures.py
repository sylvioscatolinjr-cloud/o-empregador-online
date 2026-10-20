# Synthetic regression files. No names, addresses or career data from uploaded resumes.
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
root=Path(__file__).parent
for sidebar_left in (False,True):
    c=canvas.Canvas(str(root/('resume-sidebar-left.pdf' if sidebar_left else 'resume-columns.pdf')),pagesize=A4)
    main,side=(240,40) if sidebar_left else (50,390)
    def text(x,y,value,bold=False,size=10):
        c.setFont('Helvetica-Bold' if bold else 'Helvetica',size)
        c.drawString(x,y,value)
    # Deliberately store headings and font runs outside visual reading order.
    text(main,780,'PESSOA MODELO',True,22)
    for x,y,title in [(main,500,'FORMAÇÃO ACADÊMICA'),(side,620,'CERTIFICAÇÕES'),(main,720,'EXPERIÊNCIA PROFISSIONAL'),(side,720,'COMPETÊNCIAS'),(main,380,'CURSOS REALIZADOS')]:
        text(x,y,title,True,10)
    for y,line in [(700,'Proatividade.'),(685,'Comunicação.'),(670,'Facilidade em trabalhar em'),(655,'equipe.')]: text(side,y,line,size=9)
    for y,line in [(600,'Certificação de qualidade'),(585,'Instituto Modelo - 80h'),(560,'Certificado de segurança'),(545,'Escola Exemplo - 40h')]: text(side,y,line,size=9)
    for y,line in [(700,'Empresa Modelo - Desenhista'),(685,'2023 - atual'),(660,'Oficina Exemplo - Assistente'),(645,'2021 - 2023'),(620,'Indústria Modelo - Aprendiz'),(605,'2019 - 2021'),(480,'SENAI - Aprendizagem industrial'),(465,'Concluído em 2020'),(440,'Faculdade Modelo - Graduação'),(425,'Engenharia - cursando'),(360,'Curso de CAD - Escola Modelo - 60h'),(345,'Treinamento de metrologia - 20h')]:text(main,y,line,size=10 if not sidebar_left else 9)
    text(side,760,'pessoa@example.com',size=9)
    text(side,745,'Sumaré / SP',size=9)
    c.showPage();c.save()
