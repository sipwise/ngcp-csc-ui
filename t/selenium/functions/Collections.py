import os
import random
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from functions.Functions import fill_element
from functions.Functions import scroll_to_element
from functions.Functions import click_js
from functions.Functions import check_if_unchecked


def login_csc(driver, name, pwd):
    driver.get(os.environ['CATALYST_SERVER'])
    fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="text"]', name)
    fill_element(driver, '//*[@id="csc-login-card"]//div//input[@type="password"]', pwd)
    driver.find_element(By.XPATH, '//*[@id="csc-login-card"]/div[3]/button[2]').click()


def logout_csc(driver):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="csc-header-toolbar-main"]/button[2]')))
    driver.find_element(By.XPATH, '//*[@id="csc-header-toolbar-main"]/button[2]').click()
    scroll_to_element(driver, '/html/body//div[contains(text(), "Logout")]')
    driver.find_element(By.XPATH, '/html/body//div[contains(text(), "Logout")]').click()


def login_panel(driver):
    driver.get(os.environ['CATALYST_SERVER'] + ":1443/logout")
    driver.get(os.environ['CATALYST_SERVER'] + ":1443")
    try:
        driver.implicitly_wait(1)
        driver.find_element(By.XPATH, '//*[@id="q-app"]/div/footer/div/button/span[2]/span').click()
        driver.implicitly_wait(10)
    except:
        pass
    finally:
        driver.implicitly_wait(10)
    driver.find_element(By.XPATH, '//*[@id="username"]').send_keys('administrator')
    driver.find_element(By.XPATH, '//*[@id="password"]').send_keys('administrator')
    driver.find_element(By.XPATH, '//*[@id="submit"]').click()


def logout_panel(driver):
    driver.find_element(By.XPATH, '//*[@id="top-nav"]/ul//a[contains(text(), "Logout")]').click()


def create_customer(driver, name=None):
    if not name:
        name = 'customer' + str(random.randint(1, 100000)) + 'test'
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, 'Customers').click()
    driver.find_element(By.LINK_TEXT, 'Create Customer').click()
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="contactidtable"]//tr[1]//td/input')))
    scroll_to_element(driver, '//*[@id="contactidtable"]//tr[1]//td/input')
    driver.find_element(By.XPATH, '//*[@id="contactidtable"]//tr[1]//td/input').click()
    try:
        driver.implicitly_wait(2)
        scroll_to_element(driver, '//*[@id="productidtable_filter"]/label/input')
        fill_element(driver, '//*[@id="productidtable_filter"]/label/input', 'thisshouldnotexist')
        driver.find_element(By.CSS_SELECTOR, '#productidtable tr > td.dataTables_empty')
        fill_element(driver, '//*[@id="productidtable_filter"]/label/input', 'Basic')
        driver.find_element(By.XPATH, '//*[@id="productidtable"]//tr[1]//td/input').click()
        driver.implicitly_wait(10)
    except Exception as e:
        driver.implicitly_wait(10)
        del e
    scroll_to_element(driver, '//*[@id="billing_profileidtable"]//tr[1]//td/input')
    driver.find_element(By.XPATH, '//*[@id="billing_profileidtable"]//tr[1]//td/input').click()
    scroll_to_element(driver, '//*[@id="external_id"]')
    fill_element(driver, '//*[@id="external_id"]', name)
    driver.find_element(By.XPATH, '//*[@id="save"]').click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="content"]//div[@class="alert alert-info"]')))
    return name


def delete_customer(driver, name):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, 'Customers').click()
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', 'thisshouldnotexist')
    driver.find_element(By.CSS_SELECTOR, '#Customer_table tr > td.dataTables_empty')
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', name)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="Customer_table"]//tr[1]//td[text()="%s"]' % name)))
    click_js(driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), "Terminate")]')
    driver.find_element(By.XPATH, '//*[@id="dataConfirmOK"]').click()


def create_subscriber(driver, customername, domainname):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, "Customers").click()
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', 'thisshouldnotexist')
    driver.find_element(By.CSS_SELECTOR, '#Customer_table tr > td.dataTables_empty')
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', customername)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="Customer_table"]//tr[1]//td[text()="%s"]' % customername)))
    click_js(driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), "Details")]')
    time.sleep(2)
    driver.find_element(By.XPATH, '//a[@id="toggle-accordions"]').click()
    time.sleep(1)
    scroll_to_element(driver, 'Subscribers')
    driver.find_element(By.LINK_TEXT, "Create Subscriber").click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="domainidtable_paginate"]/a[4]')))
    fill_element(driver, '//*[@id="domainidtable_filter"]//input', 'thisshouldnotexist')
    driver.find_element(By.CSS_SELECTOR, '#domainidtable tr > td.dataTables_empty')
    fill_element(driver, '//*[@id="domainidtable_filter"]//input', domainname)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="domainidtable"]//tr[1]//td[text()="%s"]' % domainname)))
    check_if_unchecked(driver, '//*[@id="domainidtable"]/tbody/tr[1]/td[4]/input')
    driver.find_element(By.XPATH, '//*[@id="webusername"]').send_keys('testuser')
    driver.find_element(By.XPATH, '//*[@id="webpassword"]').send_keys('Rand0m#PasswOrd#12345#')
    driver.find_element(By.XPATH, '//*[@id="username"]').send_keys('testuser')
    driver.find_element(By.XPATH, '//*[@id="password"]').send_keys('Rand0m#PasswOrd#12345#')
    scroll_to_element(driver, '//*[@id="administrative"]')
    driver.find_element(By.XPATH, '//*[@id="administrative"]').click()
    driver.find_element(By.XPATH, '//*[@id="save"]').click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="content"]//div[@class="alert alert-info"]')))


def delete_subscriber(driver, customername):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, 'Customers').click()
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', 'thisshouldnotexist')
    driver.find_element(By.CSS_SELECTOR, '#Customer_table tr > td.dataTables_empty')
    fill_element(driver, '//*[@id="Customer_table_filter"]//input', customername)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="Customer_table"]//tr[1]//td[text()="%s"]' % customername)))
    click_js(driver, '//*[@id="Customer_table"]//tr[1]//td//a[contains(text(), "Details")]')
    driver.find_element(By.LINK_TEXT, 'Expand Groups').click()
    scroll_to_element(driver, 'Subscribers')
    click_js(driver, '//*[@id="subscribers_table"]//tr[1]//td//a[contains(text(), "Terminate")]')
    driver.find_element(By.XPATH, '//*[@id="dataConfirmOK"]').click()


def create_domain(driver, name=None):
    if not name:
        name = 'domain' + str(random.randint(1, 100000)) + 'test'
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, 'Domains').click()
    driver.find_element(By.LINK_TEXT, 'Create Domain').click()
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="reselleridtable"]//tr[1]/td[5]/input')))
    driver.find_element(By.XPATH, '//*[@id="reselleridtable"]//tr[1]/td[5]/input').click()
    fill_element(driver, '//*[@id="domain"]', name)
    driver.find_element(By.XPATH, '//*[@id="save"]').click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="content"]//div[@class="alert alert-info"]')))
    return name


def delete_domain(driver, name):
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]')))
    driver.find_element(By.XPATH, '//*[@id="main-nav"]//*[contains(text(),"Settings")]').click()
    driver.find_element(By.LINK_TEXT, 'Domains').click()
    fill_element(driver, '//*[@id="Domain_table_filter"]//input', 'thisshouldnotexist')
    driver.find_element(By.CSS_SELECTOR, '#Domain_table tr > td.dataTables_empty')
    fill_element(driver, '//*[@id="Domain_table_filter"]//input', name)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="Domain_table"]//tr[1]//td[text()="%s"]' % name)))
    click_js(driver, '//*[@id="Domain_table"]//tr[1]//td//a[contains(text(), "Delete")]')
    driver.find_element(By.XPATH, '//*[@id="dataConfirmOK"]').click()
