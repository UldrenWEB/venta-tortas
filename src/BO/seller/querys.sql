SELECT p.id_person, p.na_person, p.ln_person, p.nu_person, p.id_address, COUNT(ag.id_assignment)  FROM person.person p 
INNER JOIN person.person_tp_person tp ON tp.id_person = p.id_person 
INNER JOIN billing.bill bi ON bi.id_person_se = p.id_person
INNER JOIN sell.assignment ag ON ag.id_person_se = p.id_person
WHERE tp.id_tp_person = 1
GROUP BY p.id_person 


SELECT p.id_person, p.na_person, p.ln_person, p.nu_person, p.id_address, COUNT(bi.id_bill) FROM person.person p INNER JOIN person.person_tp_person tp ON tp.id_person = p.id_person INNER JOIN billing.bill bi ON bi.id_person_se = p.id_person WHERE tp.id_tp_person = 1 AND 
bi.id_status_bill = 1 GROUP BY p.id_person 


-- ##DE EJEMPLO
-- SELECT p.id_person, p.na_person, p.ln_person, p.nu_person, p.id_address, COUNT(bi.id_bill) FROM person.person p 
-- INNER JOIN person.person_tp_person tp ON tp.id_person = p.id_person 
-- INNER JOIN billing.bill bi ON bi.id_person_se = p.id_person 
-- WHERE tp.id_tp_person = 1 AND bi.id_status_bill = 1 AND bi.da_bill = $1
-- GROUP BY p.id_person 

SELECT p.id_person, p.na_person, p.ln_person, p.nu_person, p.id_address, COUNT(bi.id_bill) FROM person.person p INNER JOIN person.person_tp_person tp ON tp.id_person = p.id_person INNER JOIN billing.bill bi ON bi.id_person_se = p.id_person WHERE tp.id_tp_person = 1 AND bi.id_status_bill = 1 AND bi.da_bill = $1 GROUP BY p.id_person 

-- Ahora el de rangeDate
SELECT p.id_person, p.na_person, p.ln_person, p.nu_person, p.id_address, COUNT(bi.id_bill) FROM person.person p INNER JOIN person.person_tp_person tp ON tp.id_person = p.id_person INNER JOIN billing.bill bi ON bi.id_person_se = p.id_person WHERE tp.id_tp_person = 1 AND bi.id_status_bill = 1 AND bi.da_bill BETWEEN $1 AND $2 GROUP BY p.id_person 